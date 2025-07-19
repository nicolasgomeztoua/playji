/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as availability from "../availability.js";
import type * as bookings from "../bookings.js";
import type * as courts from "../courts.js";
import type * as http from "../http.js";
import type * as reviews from "../reviews.js";
import type * as router from "../router.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";
import type * as venues from "../venues.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  availability: typeof availability;
  bookings: typeof bookings;
  courts: typeof courts;
  http: typeof http;
  reviews: typeof reviews;
  router: typeof router;
  seed: typeof seed;
  users: typeof users;
  venues: typeof venues;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
