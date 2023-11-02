import { MutationFunction, UseMutationOptions, useMutation } from 'react-query';

export interface MutationErrorWithData extends Error {
	data?: any;
}

export function useTypedMutation<
	TData = unknown,
	TError = MutationErrorWithData,
	TVariables = void,
	TContext = unknown
>(
	mutationFn: MutationFunction<TData, TVariables>,
	options?: UseMutationOptions<TData, TError, TVariables, TContext>
) {
	return useMutation<TData, TError, TVariables, TContext>(mutationFn, options);
}
