<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/env.php';

/**
 * Sends via PHP's native mail() — zero dependencies, works out of the box
 * on most Hostinger shared hosting (which pre-configures outgoing mail for
 * the hosting account's domain). Never throws: a failed send should never
 * block the underlying action (the invitation/reset itself always succeeds
 * and its token/password is still returned to the admin as a fallback).
 */
function send_email(string $to, string $subject, string $htmlBody): bool
{
    $fromAddress = env('MAIL_FROM_ADDRESS', 'no-reply@localhost');
    $fromName = env('MAIL_FROM_NAME', 'ReelBox');

    $headers = implode("\r\n", [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        sprintf('From: %s <%s>', $fromName, $fromAddress),
    ]);

    return @mail($to, $subject, $htmlBody, $headers);
}

function invitation_email_html(string $name, string $inviteLink, string $expiresAt): string
{
    $safeName = htmlspecialchars($name !== '' ? $name : 'there', ENT_QUOTES);
    $safeLink = htmlspecialchars($inviteLink, ENT_QUOTES);
    $safeExpires = htmlspecialchars($expiresAt, ENT_QUOTES);

    return <<<HTML
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1b1b1b;">
      <h2 style="color: #e31b23;">You're invited to ReelBox</h2>
      <p>Hi {$safeName},</p>
      <p>You've been invited to join ReelBox &mdash; your own digital entertainment box.</p>
      <p>
        <a href="{$safeLink}" style="display: inline-block; background: #e31b23; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Accept your invitation
        </a>
      </p>
      <p style="color: #666; font-size: 13px;">This link expires on {$safeExpires} (UTC). If you weren't expecting this, you can ignore this email.</p>
    </div>
    HTML;
}

function password_reset_email_html(string $name, string $tempPassword): string
{
    $safeName = htmlspecialchars($name !== '' ? $name : 'there', ENT_QUOTES);
    $safePassword = htmlspecialchars($tempPassword, ENT_QUOTES);

    return <<<HTML
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1b1b1b;">
      <h2 style="color: #e31b23;">Your ReelBox password was reset</h2>
      <p>Hi {$safeName},</p>
      <p>An administrator reset your password. Your temporary password is:</p>
      <p style="font-size: 18px; font-weight: bold; background: #f4f4f4; padding: 12px; border-radius: 6px; text-align: center;">{$safePassword}</p>
      <p style="color: #666; font-size: 13px;">Sign in and change this password as soon as possible.</p>
    </div>
    HTML;
}
