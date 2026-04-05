import { AxiosError, type AxiosResponse } from "axios"
import { client } from "../client-generated/client.gen"
import {
  geminiCancelDeepResearch,
  geminiDeepResearchSync,
  geminiPollDeepResearch,
  geminiStartDeepResearch,
  itemsCreateItem,
  itemsDeleteItem,
  itemsReadItem,
  itemsReadItems,
  itemsUpdateItem,
  loginLoginAccessToken,
  loginRecoverPassword,
  loginRecoverPasswordHtmlContent,
  loginResetPassword,
  loginTestToken,
  perplexityDeepResearch,
  privateCreateUser,
  tavilyCrawl,
  tavilyExtract,
  tavilyMapUrls,
  tavilySearch,
  usersCreateUser,
  usersDeleteUser,
  usersDeleteUserMe,
  usersReadUserById,
  usersReadUserMe,
  usersReadUsers,
  usersRegisterUser,
  usersUpdatePasswordMe,
  usersUpdateUser,
  usersUpdateUserMe,
} from "../client-generated/sdk.gen"
import type {
  BodyLoginLoginAccessToken,
  GeminiCancelDeepResearchResponse,
  GeminiDeepResearchRequest,
  GeminiDeepResearchSyncResponse,
  GeminiPollDeepResearchResponse,
  GeminiStartDeepResearchResponse,
  ItemCreate,
  ItemsCreateItemResponse,
  ItemsDeleteItemResponse,
  ItemsReadItemResponse,
  ItemsReadItemsResponse,
  ItemUpdate,
  ItemsUpdateItemResponse,
  LoginLoginAccessTokenResponse,
  LoginRecoverPasswordHtmlContentResponse,
  LoginRecoverPasswordResponse,
  PerplexityDeepResearchRequest,
  LoginResetPasswordResponse,
  LoginTestTokenResponse,
  PerplexityDeepResearchResponse2,
  PrivateUserCreate,
  PrivateCreateUserResponse,
  CrawlRequest,
  TavilyCrawlResponse,
  ExtractRequest,
  TavilyExtractResponse,
  MapRequest,
  TavilyMapUrlsResponse,
  SearchRequest,
  TavilySearchResponse,
  UpdatePassword,
  UserCreate,
  UserRegister,
  UserUpdate,
  UserUpdateMe,
  UsersCreateUserResponse,
  UsersDeleteUserMeResponse,
  UsersDeleteUserResponse,
  UsersReadUserByIdResponse,
  UsersReadUserMeResponse,
  UsersReadUsersResponse,
  UsersRegisterUserResponse,
  UsersUpdatePasswordMeResponse,
  UsersUpdateUserMeResponse,
  UsersUpdateUserResponse,
} from "../client-generated/types.gen"

export { AxiosError as ApiError }
export { client }
export * from "../client-generated/types.gen"
export * from "./types.gen"

export type { BodyLoginLoginAccessToken as Body_login_login_access_token }

type TokenResolver = string | (() => Promise<string> | string) | undefined
type RequestBodyData<T> = { requestBody: T }
type EmailData = { email: string }
type UserIdData = { userId: string }
type IdData = { id: string }
type PaginationData = {
  limit?: number
  skip?: number
}
type ItemsReadData = PaginationData & {
  contentType?: string | null
}
type GeminiPollData = {
  interactionId: string
  lastEventId?: string | null
}
type GeminiCancelData = {
  interactionId: string
}
type LoginAccessTokenData = {
  formData?: BodyLoginLoginAccessToken
  requestBody?: BodyLoginLoginAccessToken
}

const unwrap = async <T>(promise: Promise<AxiosResponse<T>>) => {
  const response = await promise
  return response.data
}

let baseUrl = ""
let tokenResolver: TokenResolver

const syncClientConfig = () => {
  client.setConfig({
    ...(baseUrl ? { baseURL: baseUrl } : {}),
    auth: tokenResolver
      ? async () =>
          typeof tokenResolver === "function"
            ? await tokenResolver()
            : tokenResolver
      : undefined,
  })
}

export type OpenAPIConfig = {
  BASE: string
  TOKEN?: TokenResolver
}

export const OpenAPI: OpenAPIConfig = {
  get BASE() {
    return baseUrl
  },
  set BASE(value: string) {
    baseUrl = value
    syncClientConfig()
  },
  get TOKEN() {
    return tokenResolver
  },
  set TOKEN(value: TokenResolver) {
    tokenResolver = value
    syncClientConfig()
  },
}

export class LoginService {
  public static loginAccessToken(data: LoginAccessTokenData) {
    return unwrap<LoginLoginAccessTokenResponse>(
      loginLoginAccessToken({
        body: (data.formData ?? data.requestBody) as BodyLoginLoginAccessToken,
        throwOnError: true,
      }),
    )
  }

  public static testToken() {
    return unwrap<LoginTestTokenResponse>(
      loginTestToken({
        throwOnError: true,
      }),
    )
  }

  public static recoverPassword(data: EmailData) {
    return unwrap<LoginRecoverPasswordResponse>(
      loginRecoverPassword({
        path: {
          email: data.email,
        },
        throwOnError: true,
      }),
    )
  }

  public static resetPassword(data: RequestBodyData<{ new_password: string; token: string }>) {
    return unwrap<LoginResetPasswordResponse>(
      loginResetPassword({
        body: data.requestBody,
        throwOnError: true,
      }),
    )
  }

  public static recoverPasswordHtmlContent(data: EmailData) {
    return unwrap<LoginRecoverPasswordHtmlContentResponse>(
      loginRecoverPasswordHtmlContent({
        path: {
          email: data.email,
        },
        throwOnError: true,
      }),
    )
  }
}

export class UsersService {
  public static readUsers(data: PaginationData = {}) {
    return unwrap<UsersReadUsersResponse>(
      usersReadUsers({
        query: {
          skip: data.skip,
          limit: data.limit,
        },
        throwOnError: true,
      }),
    )
  }

  public static createUser(data: RequestBodyData<UserCreate>) {
    return unwrap<UsersCreateUserResponse>(
      usersCreateUser({
        body: data.requestBody,
        throwOnError: true,
      }),
    )
  }

  public static readUserMe() {
    return unwrap<UsersReadUserMeResponse>(
      usersReadUserMe({
        throwOnError: true,
      }),
    )
  }

  public static deleteUserMe() {
    return unwrap<UsersDeleteUserMeResponse>(
      usersDeleteUserMe({
        throwOnError: true,
      }),
    )
  }

  public static updateUserMe(data: RequestBodyData<UserUpdateMe>) {
    return unwrap<UsersUpdateUserMeResponse>(
      usersUpdateUserMe({
        body: data.requestBody,
        throwOnError: true,
      }),
    )
  }

  public static updatePasswordMe(data: RequestBodyData<UpdatePassword>) {
    return unwrap<UsersUpdatePasswordMeResponse>(
      usersUpdatePasswordMe({
        body: data.requestBody,
        throwOnError: true,
      }),
    )
  }

  public static registerUser(data: RequestBodyData<UserRegister>) {
    return unwrap<UsersRegisterUserResponse>(
      usersRegisterUser({
        body: data.requestBody,
        throwOnError: true,
      }),
    )
  }

  public static readUserById(data: UserIdData) {
    return unwrap<UsersReadUserByIdResponse>(
      usersReadUserById({
        path: {
          user_id: data.userId,
        },
        throwOnError: true,
      }),
    )
  }

  public static updateUser(data: UserIdData & RequestBodyData<UserUpdate>) {
    return unwrap<UsersUpdateUserResponse>(
      usersUpdateUser({
        body: data.requestBody,
        path: {
          user_id: data.userId,
        },
        throwOnError: true,
      }),
    )
  }

  public static deleteUser(data: UserIdData) {
    return unwrap<UsersDeleteUserResponse>(
      usersDeleteUser({
        path: {
          user_id: data.userId,
        },
        throwOnError: true,
      }),
    )
  }
}

export class ItemsService {
  public static readItems(data: ItemsReadData = {}) {
    return unwrap<ItemsReadItemsResponse>(
      itemsReadItems({
        query: {
          content_type: data.contentType as never,
          limit: data.limit,
          skip: data.skip,
        },
        throwOnError: true,
      }),
    )
  }

  public static createItem(data: RequestBodyData<ItemCreate>) {
    return unwrap<ItemsCreateItemResponse>(
      itemsCreateItem({
        body: data.requestBody,
        throwOnError: true,
      }),
    )
  }

  public static readItem(data: IdData) {
    return unwrap<ItemsReadItemResponse>(
      itemsReadItem({
        path: {
          id: data.id,
        },
        throwOnError: true,
      }),
    )
  }

  public static updateItem(data: IdData & RequestBodyData<ItemUpdate>) {
    return unwrap<ItemsUpdateItemResponse>(
      itemsUpdateItem({
        body: data.requestBody,
        path: {
          id: data.id,
        },
        throwOnError: true,
      }),
    )
  }

  public static deleteItem(data: IdData) {
    return unwrap<ItemsDeleteItemResponse>(
      itemsDeleteItem({
        path: {
          id: data.id,
        },
        throwOnError: true,
      }),
    )
  }
}

export class TavilyService {
  public static search(data: RequestBodyData<SearchRequest>) {
    return unwrap<TavilySearchResponse>(
      tavilySearch({
        body: data.requestBody,
        throwOnError: true,
      }),
    )
  }

  public static extract(data: RequestBodyData<ExtractRequest>) {
    return unwrap<TavilyExtractResponse>(
      tavilyExtract({
        body: data.requestBody,
        throwOnError: true,
      }),
    )
  }

  public static crawl(data: RequestBodyData<CrawlRequest>) {
    return unwrap<TavilyCrawlResponse>(
      tavilyCrawl({
        body: data.requestBody,
        throwOnError: true,
      }),
    )
  }

  public static mapUrls(data: RequestBodyData<MapRequest>) {
    return unwrap<TavilyMapUrlsResponse>(
      tavilyMapUrls({
        body: data.requestBody,
        throwOnError: true,
      }),
    )
  }
}

export class PerplexityService {
  public static deepResearch(data: RequestBodyData<PerplexityDeepResearchRequest>) {
    return unwrap<PerplexityDeepResearchResponse2>(
      perplexityDeepResearch({
        body: data.requestBody,
        throwOnError: true,
      }),
    )
  }
}

export class GeminiService {
  public static deepResearchSync(data: RequestBodyData<GeminiDeepResearchRequest>) {
    return unwrap<GeminiDeepResearchSyncResponse>(
      geminiDeepResearchSync({
        body: data.requestBody,
        throwOnError: true,
      }),
    )
  }

  public static startDeepResearch(data: RequestBodyData<GeminiDeepResearchRequest>) {
    return unwrap<GeminiStartDeepResearchResponse>(
      geminiStartDeepResearch({
        body: data.requestBody,
        throwOnError: true,
      }),
    )
  }

  public static pollDeepResearch(data: GeminiPollData) {
    return unwrap<GeminiPollDeepResearchResponse>(
      geminiPollDeepResearch({
        path: {
          interaction_id: data.interactionId,
        },
        query: {
          last_event_id: data.lastEventId,
        },
        throwOnError: true,
      }),
    )
  }

  public static cancelDeepResearch(data: GeminiCancelData) {
    return unwrap<GeminiCancelDeepResearchResponse>(
      geminiCancelDeepResearch({
        path: {
          interaction_id: data.interactionId,
        },
        throwOnError: true,
      }),
    )
  }
}

export class PrivateService {
  public static createUser(data: RequestBodyData<PrivateUserCreate>) {
    return unwrap<PrivateCreateUserResponse>(
      privateCreateUser({
        body: data.requestBody,
        throwOnError: true,
      }),
    )
  }
}
