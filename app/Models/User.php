<?php

namespace App\Models;

use App\Enums\RoleType;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role_id',
        'address',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'seller_id');
    }

    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class, 'customer_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    public function assignedOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'delivery_person_id');
    }

    public function hasRole(RoleType|string $role): bool
    {
        $roleSlug = $role instanceof RoleType ? $role->value : $role;

        return $this->relationLoaded('role')
            ? $this->role?->slug === $roleSlug
            : $this->role()->where('slug', $roleSlug)->exists();
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->relationLoaded('role') && $this->role?->relationLoaded('permissions')) {
            return $this->role->permissions->contains('slug', $permission);
        }

        return $this->role()
            ->whereHas('permissions', fn ($query) => $query->where('slug', $permission))
            ->exists();
    }
}
