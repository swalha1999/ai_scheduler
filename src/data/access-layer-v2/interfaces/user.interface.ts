import { users, User } from "@/data/access-layer-v2/schemas/auth.schema";
import { BaseSearchParams } from "./base.interface";

/**
 * Interface for the user table
 * @description This interface is used to define the structure of the user table
 * @returns {Object} The interface for the user table with the following fields:
 */
export const userInterfaceSelect = {
    id: users.id,
    email: users.email,
    username: users.username,
    phone: users.phone,
    email_verified: users.email_verified,
    photo_url: users.photo_url,
    is_admin: users.is_admin,
    is_super_admin: users.is_super_admin,
    is_developer: users.is_developer,
    password_hash: users.password_hash,
    recovery_code: users.recovery_code,
    totp_key: users.totp_key,
    registered_2fa: users.registered_2fa,
    google_id: users.google_id,
}

export type UserInterface = {
    id: User['id'];
    email: User['email'];
    username: User['username'];
    phone: User['phone'];
    email_verified: User['email_verified'];
    photo_url: User['photo_url'];
    is_admin: User['is_admin'];
    is_super_admin: User['is_super_admin'];
    is_developer: User['is_developer'];
    password_hash: User['password_hash'];
    recovery_code: User['recovery_code'];
    totp_key: User['totp_key'];
    registered_2fa: User['registered_2fa'];
    google_id: User['google_id'];
}

export interface UserSearchParams extends BaseSearchParams {
    email?: User['email'];
    username?: User['username'];
    phone?: User['phone'];
    email_verified?: User['email_verified'];
    is_admin?: User['is_admin'];
    is_super_admin?: User['is_super_admin'];
}