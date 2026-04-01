<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/api/documentation', function () {
    return view('swagger', [
        'openApiUrl' => url('/api/v1/docs/openapi'),
    ]);
})->name('api.documentation');
