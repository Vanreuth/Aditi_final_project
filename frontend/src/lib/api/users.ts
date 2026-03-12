/**
 * lib/api/users.ts
 *
 * CRUD operations for the /api/v1/users endpoint.
 *
 * Usage:
 *   import { fetchUsers, fetchUser, createUser } from '@/lib/api/users'
 */

import { get, post, put, del, buildFormData } from '@/lib/api/client'
import type { PageResponse, PaginationParams } from '@/types/apiType'
import type {
  UserResponse,
  UserRequest,
  UpdateUserRequest,
} from '@/types/userType'

const USER_PATH = '/api/v1/users'

/** GET /users — paginated list of all users. */
export async function fetchUsers(
  params: PaginationParams = {}
): Promise<PageResponse<UserResponse>> {
  const { page = 0, size = 10, sortBy = 'id', sortDir = 'asc' } = params
  return get<PageResponse<UserResponse>>(USER_PATH, {
    params: { page, size, sortBy, sortDir },
  })
}

/** GET /users/:id — fetch a single user by ID. */
export async function fetchUser(id: number): Promise<UserResponse> {
  return get<UserResponse>(`${USER_PATH}/${id}`)
}

/** POST /users — [ADMIN] create a user. Optionally attaches a profile picture. */
export async function createUser(
  payload: UserRequest,
  profilePicture?: File
): Promise<UserResponse> {
  const form = buildFormData(
    payload as unknown as Record<string, unknown>,
    { profilePicture }
  )
  return post<UserResponse>(USER_PATH, form, { multipart: true })
}

/** PUT /users/:id — [ADMIN] update a user's details. */
export async function updateUser(
  id: number,
  payload: UpdateUserRequest
): Promise<UserResponse> {
  return put<UserResponse>(`${USER_PATH}/${id}`, payload)
}

/** DELETE /users/:id — [ADMIN] remove a user. */
export async function deleteUser(id: number): Promise<void> {
  return del<void>(`${USER_PATH}/${id}`, { raw: true })
}
