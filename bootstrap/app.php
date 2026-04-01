<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'jwt.auth' => \App\Http\Middleware\JwtAuthenticate::class,
            'role' => \App\Http\Middleware\EnsureRole::class,
            'permission' => \App\Http\Middleware\EnsurePermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\App\Exceptions\ApiException $exception, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                return \App\Helpers\ApiResponse::error(
                    $exception->getMessage(),
                    $exception->status(),
                    $exception->errors(),
                );
            }
        });

        $exceptions->render(function (\Illuminate\Validation\ValidationException $exception, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                return \App\Helpers\ApiResponse::error(
                    'The given data was invalid.',
                    422,
                    $exception->errors(),
                );
            }
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $exception, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                return \App\Helpers\ApiResponse::error('Resource not found.', 404);
            }
        });

        $exceptions->render(function (\Throwable $exception, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                report($exception);

                return \App\Helpers\ApiResponse::error(
                    config('app.debug') ? $exception->getMessage() : 'Server error.',
                    500
                );
            }
        });
    })->create();
