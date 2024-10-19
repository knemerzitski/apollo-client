import type {
  QueryOptions,
  WatchQueryOptions,
  MutationOptions,
  OperationVariables,
} from "../../core/index.js";

import { compact } from "./compact.js";

type OptionsUnion<TData, TVariables extends OperationVariables, TContext> =
  | WatchQueryOptions<TVariables, TData>
  | QueryOptions<TVariables, TData>
  | MutationOptions<TData, TVariables, TContext, any>;

export function mergeOptions<
  TDefaultOptions extends Partial<OptionsUnion<any, any, any>>,
  TOptions extends TDefaultOptions,
>(
  defaults: TDefaultOptions | Partial<TDefaultOptions> | undefined,
  options: TOptions | Partial<TOptions>,
  config?: {
    /**
     * Shallow merge `context` property
     * @default false
     */
    mergeContext?: boolean;
  }
): TOptions & TDefaultOptions {
  return compact(
    defaults,
    options,
    config?.mergeContext &&
      options.context && {
        context: compact({
          ...(defaults && defaults.context),
          ...options.context,
        }),
      },
    options.variables && {
      variables: compact({
        ...(defaults && defaults.variables),
        ...options.variables,
      }),
    }
  );
}
