#!/bin/sh
set -e

# Script ini jalan pertama kali setiap container hidup
# Bisa ditambahkan setup spesifik di sini nantinya (seperti symlink storage dll)

exec "$@"
