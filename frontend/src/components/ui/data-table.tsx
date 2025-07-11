'use client';
// https://github.com/TanStack/table/issues/5567
'use no memo';

import type {
    ColumnDef,
    TableOptions,
} from '@tanstack/react-table';

import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { LoaderCircle } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from './data-table-pagination';

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    tableOptions?: Partial<TableOptions<TData>>;
    isLoading?: boolean;
}

const defaultData: any[] = [];

export function DataTable<TData, TValue>({
    columns,
    data,
    tableOptions,
    isLoading,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data: data || defaultData,
        columns,
        // @ts-expect-error
        getRowId: (row) => row?.id,
        getCoreRowModel: getCoreRowModel(),
        ...(!tableOptions?.manualPagination && { getPaginationRowModel: getPaginationRowModel() }),
        ...tableOptions,
    });

    return (
        <div className="flex flex-col w-full space-y-4 min-h-px">
            <div className="rounded-md truncate border relative">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext(),
                                                    )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length
                            ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && 'selected'}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ),
                                    )
                                )
                            : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            Данных нет
                                        </TableCell>
                                    </TableRow>
                                )}
                    </TableBody>
                </Table>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[1px]">
                        <div className="w-6 h-6 flex">
                            <LoaderCircle className="animate-spin w-6 h-6" />
                        </div>
                    </div>
                )}
            </div>
            <DataTablePagination table={table} />
        </div>
    );
}
