import { QueryFunction, QueryKey, useQuery } from 'react-query';

import { notReachable } from '../helpers/notReachable';

type AsyncCellProps<TData> = {
  queryKey: QueryKey;
  queryFn: QueryFunction<TData>;
  onLoad: (data: TData) => JSX.Element;
};

export const AsyncCell = <TData extends Object>({
  queryKey,
  queryFn,
  onLoad,
}: AsyncCellProps<TData>) => {
  const query = useQuery(queryKey, queryFn);

  switch (query.status) {
    case 'idle':
    case 'loading':
      return (
        <div role="status" className="max-w-sm animate-pulse">
          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-10 mb-4" />
          <span className="sr-only">Loading...</span>
        </div>
      );

    case 'error':
      return <div>Failed to load</div>;

    case 'success':
      return onLoad(query.data);

    /* istanbul ignore next */
    default:
      return notReachable(query);
  }
};
