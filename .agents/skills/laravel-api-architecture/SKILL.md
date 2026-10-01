---
name: laravel-api-architecture
description: >-
  Gunakan skill ini setiap kali mengimplementasikan fitur API baru di project
  Anteraja Backend (Laravel 12). Skill ini mendefinisikan standar arsitektur
  wajib: struktur folder, konvensi penamaan, cara membuat Enum, FormRequest,
  Controller (versioned), Model, Route, dan Response format yang harus konsisten
  di seluruh codebase.
---

# Laravel API Architecture — Standar Anteraja Backend

Dokumen ini adalah **standar wajib** untuk setiap implementasi fitur API baru
di project ini. Baca dan ikuti seluruh bagian sebelum menulis kode apapun.

---

## 1. Struktur Folder Wajib

```
app/
├── Enums/                          ← Semua PHP Backed Enum
│   ├── ManifestTypeEnum.php
│   └── ManifestStatusEnum.php
├── Http/
│   ├── Controllers/
│   │   ├── Controller.php          ← Base controller (jangan diubah)
│   │   └── Api/
│   │       └── V1/                 ← SEMUA controller API masuk sini
│   │           ├── HubController.php
│   │           └── ManifestController.php
│   └── Requests/                   ← Satu FormRequest per use case
│       └── GenerateManifestRequest.php
├── Models/                         ← Satu file per tabel
│   ├── Hub.php
│   ├── Manifest.php
│   ├── Package.php
│   ├── ManifestPackage.php         ← Model pivot juga wajib dibuat
│   └── Courier.php
routes/
└── api.php                         ← Semua route API didaftarkan di sini
```

---

## 2. Enums (`app/Enums/`)

Gunakan **PHP 8.1 Backed Enum** untuk setiap kolom dengan nilai terbatas (status, type, role, dll).

```php
<?php

namespace App\Enums;

enum ManifestStatusEnum: string
{
    case MENUNGGU_KEDATANGAN = 'MENUNGGU_KEDATANGAN';
    case SUDAH_DITERIMA      = 'SUDAH_DITERIMA';
    case SELESAI             = 'SELESAI';
}
```

**Aturan:**
- Nama file: `{Domain}{Field}Enum.php` → `ManifestStatusEnum.php`
- Selalu gunakan `string` sebagai backing type
- Daftarkan di `$casts` pada Model yang bersangkutan:
  ```php
  protected $casts = [
      'status' => ManifestStatusEnum::class,
  ];
  ```
- Saat serialisasi ke JSON di Controller, gunakan `.value` karena Enum tidak otomatis ter-serialize:
  ```php
  'status' => $model->status instanceof \BackedEnum
      ? $model->status->value
      : $model->status,
  ```

---

## 3. Models (`app/Models/`)

Setiap tabel database **wajib** punya Model. Termasuk tabel pivot.

```php
<?php

namespace App\Models;

use App\Enums\ManifestStatusEnum;
use Illuminate\Database\Eloquent\Model;

class Manifest extends Model
{
    // Jika PK bukan auto-increment integer (string ID, custom PK):
    protected $primaryKey  = 'manifest_code';
    public    $incrementing = false;
    protected $keyType     = 'string';

    protected $guarded = []; // Gunakan guarded kosong, bukan fillable

    protected $casts = [
        'status'        => ManifestStatusEnum::class,
        'eta_timestamp' => 'datetime',
        'is_priority'   => 'boolean',
    ];

    // Relasi selalu didefinisikan di Model
    public function originHub()
    {
        return $this->belongsTo(Hub::class, 'origin_hub_id', 'id');
    }

    public function packages()
    {
        return $this->belongsToMany(
            Package::class,
            'manifest_packages', // nama tabel pivot
            'manifest_code',     // FK ke model ini
            'tracking_id'        // FK ke model target
        );
    }
}
```

**Aturan:**
- Gunakan `$guarded = []` bukan `$fillable` (lebih fleksibel untuk insert massal)
- String PK wajib set `$primaryKey`, `$incrementing = false`, `$keyType = 'string'`
- Model pivot (`ManifestPackage`) cukup minimal: `protected $table` dan `$guarded = []`
- Lazy-load relasi saat dibutuhkan, JANGAN eager-load di list endpoint

---

## 4. FormRequest (`app/Http/Requests/`)

Setiap endpoint yang menerima input **wajib** menggunakan FormRequest — tidak boleh validasi inline di Controller.

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateManifestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Sesuaikan dengan auth logic nanti
    }

    public function rules(): array
    {
        return [
            'destination_hub_id' => 'required|string|exists:hubs,id',
            'total_packages'     => 'required|integer|min:1|max:150',
            'manifest_code'      => 'nullable|string|max:50|unique:manifests,manifest_code',
        ];
    }

    public function messages(): array
    {
        return [
            'destination_hub_id.required' => 'Hub tujuan wajib dipilih.',
            'destination_hub_id.exists'   => 'Hub tujuan tidak ditemukan.',
        ];
    }
}
```

**Aturan:**
- Nama file: `{Verb}{Domain}Request.php` → `GenerateManifestRequest.php`, `StoreHubRequest.php`
- Selalu sertakan `messages()` dengan pesan error Bahasa Indonesia
- Gunakan sebagai type-hint di parameter Controller, bukan `Request $request`:
  ```php
  public function store(GenerateManifestRequest $request): JsonResponse
  ```

---

## 5. Controllers (`app/Http/Controllers/Api/V1/`)

Semua controller API **wajib** berada di namespace `App\Http\Controllers\Api\V1`.

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Hub;
use Illuminate\Http\JsonResponse;

class HubController extends Controller
{
    public function index(): JsonResponse
    {
        $hubs = Hub::select('id', 'name', 'region_name', 'location_tag')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $hubs,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $hub = Hub::find($id);

        if (! $hub) {
            return response()->json([
                'success' => false,
                'message' => 'Hub tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $hub,
        ]);
    }
}
```

**Single Action Controller** (untuk operasi kompleks seperti generate):
```php
// Nama file: GenerateManifestController.php di Controllers/ (root, bukan Api/V1/)
class GenerateManifestController extends Controller
{
    public function __invoke(GenerateManifestRequest $request): JsonResponse
    {
        // logic...
    }
}
```

**Aturan:**
- CRUD standar → `Api\V1\{Domain}Controller` dengan method: `index`, `show`, `store`, `update`, `destroy`
- Operasi kompleks / non-CRUD → Single Action Controller (`__invoke`) di root `Controllers/`
- Selalu return `JsonResponse` dengan type-hint
- Return type selalu: `{ success: bool, data: ... }` atau `{ success: bool, message: string }`
- Untuk list dengan paginasi, gunakan format `{ success: true, data: { items: [], meta: {} } }`
- **JANGAN** eager-load relasi yang berat di list endpoint — gunakan lazy load di show endpoint

---

## 6. Routes (`routes/api.php`)

```php
Route::prefix('v1')->group(function () {

    // [GET] Resource standar
    Route::get('/hubs', [HubController::class, 'index']);
    Route::get('/hubs/{hubId}', [HubController::class, 'show']);

    // [POST/PUT/DELETE] Resource standar
    Route::post('/manifests', [ManifestController::class, 'store']);

    // Single Action — HARUS didefinisikan SEBELUM route dengan parameter
    Route::post('/manifests/generate', GenerateManifestController::class);

    // Route dengan parameter — SELALU di bawah
    Route::get('/manifests/{manifestCode}', [ManifestController::class, 'show']);
});
```

**Aturan urutan route (KRITIS):**
1. Static route (`/manifests/generate`) **HARUS** di atas route parametrik (`/manifests/{code}`)
2. Jika terbalik, `generate` akan tertangkap sebagai nilai `{code}` → 404

---

## 7. Response Format Standar

| Skenario | HTTP Status | Shape |
|---|---|---|
| List tanpa paginasi | 200 | `{ success: true, data: [...] }` |
| List dengan paginasi | 200 | `{ success: true, data: { items: [...], meta: { current_page, per_page, total, last_page } } }` |
| Detail satu resource | 200 | `{ success: true, data: { ... } }` |
| Create berhasil | 201 | `{ success: true, message: "...", data: { ... } }` |
| Not Found | 404 | `{ success: false, message: "... tidak ditemukan." }` |
| Validation Error | 422 | Auto Laravel FormRequest |
| Server Error | 500 | `{ success: false, message: "...", error: "..." }` |

---

## 8. Database: Batch Insert vs Loop

```php
// ✅ BENAR — Satu query untuk N baris
Package::insert($packagesData);

// ❌ SALAH — N query untuk N baris (sangat lambat untuk data > 10)
foreach ($packages as $pkg) {
    Package::create($pkg);
}
```

Untuk operasi yang menyentuh beberapa tabel sekaligus, selalu bungkus dengan transaction:
```php
DB::beginTransaction();
try {
    Manifest::create([...]);
    Package::insert($packagesData);
    ManifestPackage::insert($pivotData);
    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
}
```

---

## 9. Checklist Implementasi Fitur Baru

Sebelum membuat fitur baru, centang checklist ini:

- [ ] Apakah ada kolom enum? → Buat `app/Enums/{Domain}{Field}Enum.php`
- [ ] Apakah ada tabel baru? → Buat `app/Models/{Domain}.php` dengan PK dan casts yang benar
- [ ] Apakah ada tabel pivot? → Buat `app/Models/{Pivot}.php` minimal
- [ ] Apakah endpoint menerima input? → Buat `app/Http/Requests/{Verb}{Domain}Request.php`
- [ ] Apakah operasi CRUD standar? → Buat `app/Http/Controllers/Api/V1/{Domain}Controller.php`
- [ ] Apakah operasi kompleks/non-CRUD? → Buat Single Action Controller di `Controllers/`
- [ ] Sudah daftarkan route di `routes/api.php` dengan urutan yang benar?
- [ ] Response format sudah sesuai standar (success/data/message/meta)?
- [ ] Seeder sudah menggunakan `upsert` (bukan `insert`) agar idempotent?
- [ ] Migration sudah menggunakan `hasTable` check agar idempotent?
