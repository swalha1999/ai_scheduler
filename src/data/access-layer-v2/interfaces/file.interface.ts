import { files, File } from "@/data/access-layer-v2/schemas/files.schema";
import { users, User } from "@/data/access-layer-v2/schemas/auth.schema";
import { BaseSearchParams } from "./base.interface";

/**
 * Interface for the files table
 * @description This interface is used to define the structure of the files table
 * @returns {Object} The interface for the files table with the following fields:
 */
export const fileInterfaceSelect = {
    id: files.id,
    fileName: files.fileName,
    uploadedAt: files.uploadedAt,
    uploadedBy: files.uploadedBy,
    // User fields from join
    email: users.email,
    username: users.username,
}

export type FileInterface = {
    id: File['id'];
    fileName: File['fileName'];
    uploadedAt: File['uploadedAt'];
    uploadedBy: File['uploadedBy'];
    email: User['email'];
    username: User['username'];
}

export interface FileSearchParams extends BaseSearchParams {
    fileName?: File['fileName'];
    uploadedAt?: File['uploadedAt'];
    uploadedBy?: User['id'];
}