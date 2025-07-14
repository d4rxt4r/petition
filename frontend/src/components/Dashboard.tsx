'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { TrashIcon } from 'lucide-react';
import { env } from 'next-runtime-env';
import { useEffect, useState } from 'react';
import { PetitionStatus, PetitionStatusOptions, TableFilterOptions } from '@/enums';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { DataTable } from './ui/data-table';
import { DatePicker } from './ui/date-picker';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

import { SelectExt } from './ui/select-ext';
import { ToggleExt } from './ui/toggle-ext';

async function fetchTableData(controller: AbortController) {
    const NEXT_PUBLIC_ENV = env('NEXT_PUBLIC_ENV');
    const apiPath = NEXT_PUBLIC_ENV === 'dev' ? 'http://localhost/api/vote/all_user' : '/api/vote/all_user';
    try {
        const res = await fetch(apiPath, {
            signal: controller.signal,
        });
        const data = await res.json();
        return data;
    } catch (e) {
        console.error(e);
    }
}

export function Dashboard() {
    const [startDate, setStartDate] = useState<Date | undefined>(() => new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(() => new Date());

    const [status, setStatus] = useState(PetitionStatus.ACTIVE.toString());

    const [count, setCount] = useState(0);
    const [useRealCount, setUseRealCount] = useState(false);

    const updateVoting = async () => {
        console.log(startDate, endDate, status, count, useRealCount);
    };

    const [tableData, setTableData] = useState<Array<{ valid_vote: boolean }>>(() => []);
    const [tableFilter, setTableFilter] = useState(TableFilterOptions[0].value);
    const filteredData = tableData.filter((rec) => {
        if (tableFilter === '0') {
            return rec.valid_vote === true;
        }
        if (tableFilter === '1') {
            return rec.valid_vote === false;
        }
        return true;
    });

    useEffect(() => {
        const controller = new AbortController();
        fetchTableData(controller);
        return () => controller.abort();
    }, []);

    const onRemove = async (voteId: number) => {
        const NEXT_PUBLIC_ENV = env('NEXT_PUBLIC_ENV');
        const apiPath = NEXT_PUBLIC_ENV === 'dev' ? 'http://localhost/api/vote/update_user' : '/api/vote/update_user';
        try {
            const res = await fetch(apiPath, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: voteId,
                    valid_vote: false,
                }),
            });
            const data = await res.json();
            if (res.status === 200) {
                const controller = new AbortController();
                const data = await fetchTableData(controller);
                setTableData(data);
            } else {
                console.error(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const columns: ColumnDef<any>[] = [{
        accessorKey: 'full_name',
        header: 'ФИО',
    }, {
        accessorKey: 'phone_number',
        header: 'Телефон',
    }, {
        accessorKey: 'email',
        header: 'Почта',
    }, {
        id: 'actions',
        cell: ({ row }) => {
            const vote = row.original;
            return (
                <div className="flex gap-4 justify-end">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="secondary">
                                <TrashIcon />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <div className="flex justify-between items-baseline">
                                Пометить голос невалидным?
                                <Button variant="destructive" size="sm" onClick={() => onRemove(vote.id)}>Да</Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            );
        },
    }];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h2>
                    Дата начала и дата окончания сбора подписей
                </h2>
                <div className="flex gap-4">
                    <DatePicker value={startDate} onChange={setStartDate} />
                    <DatePicker value={endDate} onChange={setEndDate} />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <h2>
                    Статус петиции
                </h2>
                <div>
                    <ToggleExt
                        type="single"
                        variant="outline"
                        value={status?.toString()}
                        onValueChange={(status) => {
                            setStatus(status);
                        }}
                        options={PetitionStatusOptions}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <h2>
                    Количество голосов
                </h2>
                <div className="flex gap-4 items-center">
                    <Input disabled={useRealCount} type="number" value={count} onChange={(e) => setCount(Number.parseInt(e.target.value))} className="w-fit" />
                    <Checkbox checked={useRealCount} onCheckedChange={(checked) => setUseRealCount(Boolean(checked))} />
                    <span>Использовать настоящее кол-во</span>
                </div>
            </div>

            <div>
                <Button onClick={updateVoting}>Сохранить</Button>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center w-full">
                    <h2>
                        Собранные подписи
                    </h2>
                    <div>
                        <SelectExt placeholder="Фильтр по валидности записей" value={tableFilter} onValueChange={setTableFilter} options={TableFilterOptions} />
                    </div>
                </div>
                <div>
                    <DataTable columns={columns} data={filteredData} />
                </div>
            </div>
        </div>
    );
}
