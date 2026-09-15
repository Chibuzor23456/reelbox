<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

function audit_log(
    string $adminId,
    string $action,
    ?string $targetType = null,
    ?string $targetId = null,
    string $result = 'success',
    ?array $metadata = null,
): void {
    db()->prepare(
        'INSERT INTO audit_logs (id, admin_id, action, target_type, target_id, result, metadata, created_at)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW())'
    )->execute([
        $adminId,
        $action,
        $targetType,
        $targetId,
        $result,
        $metadata !== null ? json_encode($metadata) : null,
    ]);
}
