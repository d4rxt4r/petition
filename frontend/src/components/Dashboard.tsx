'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { TrashIcon } from 'lucide-react';
import { env } from 'next-runtime-env';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PetitionStatusOptions, TableFilterOptions } from '@/enums';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { DataTable } from './ui/data-table';
import { DatePicker } from './ui/date-picker';
import { Input } from './ui/input';

import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { SelectExt } from './ui/select-ext';
import { ToggleExt } from './ui/toggle-ext';

async function fetchTableData(controller: AbortController, router: any) {
    const NEXT_PUBLIC_ENV = env('NEXT_PUBLIC_ENV');
    const apiPath = NEXT_PUBLIC_ENV === 'dev' ? 'http://localhost/api/vote/all_user' : '/api/vote/all_user';
    try {
        const res = await fetch(apiPath, {
            signal: controller.signal,
        });
        if (res.status === 422) {
            router.push('/auth');
        }
        const data = await res.json();
        return data;
    } catch (e) {
        console.error(e);
    }
}

const emptyArray: any[] = [];

export function Dashboard() {
    const NEXT_PUBLIC_ENV = env('NEXT_PUBLIC_ENV');
    const router = useRouter();
    const [petitionState, setPetitionState] = useState<any>(() => { });

    useEffect(() => {
        const controller = new AbortController();

        const fetchCount = async () => {
            const NEXT_PUBLIC_ENV = env('NEXT_PUBLIC_ENV');
            const apiPath = NEXT_PUBLIC_ENV === 'dev' ? 'http://localhost/api/vote/dash_vote_info' : '/api/vote/dash_vote_info';
            try {
                const res = await fetch(apiPath, {
                    signal: controller.signal,
                });
                if (res.status === 422) {
                    router.push('/auth');
                }
                const data = await res.json();
                setPetitionState({
                    ...data,
                    start_date: new Date(data.start_date),
                    end_date: new Date(data.end_date),
                });
            } catch (e) {
                console.error(e);
            }
        };

        fetchCount();

        return () => controller.abort('');
    }, [router]);

    const updateVoting = async () => {
        const apiPath = NEXT_PUBLIC_ENV === 'dev' ? 'http://localhost/api/vote/update_vote' : '/api/vote/update_vote';
        const res = await fetch(apiPath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(petitionState),
        });
        if (res.status === 422) {
            router.push('/auth');
        }
        if (res.status === 200) {
            toast.success('Данные успешно обновлены');
        } else {
            console.error(res);
            toast.error('Ошибка при обновлении данных');
        }
    };

    const [tableData, setTableData] = useState<Array<{ valid_vote: boolean }>>(() => []);
    const [tableFilter, setTableFilter] = useState(TableFilterOptions[0].value);
    const filteredData = tableData
        ? tableData.filter((rec) => {
                if (tableFilter === '0') {
                    return rec.valid_vote === true;
                }
                if (tableFilter === '1') {
                    return rec.valid_vote === false;
                }
                return true;
            })
        : emptyArray;

    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            const data = await fetchTableData(controller, router);
            setTableData(data);
        })();
        return () => controller.abort('');
    }, [router]);

    const onRemove = async (voteId: number) => {
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
            if (res.status === 422) {
                router.push('/auth');
            }
            const data = await res.json();
            if (res.status === 200) {
                toast.success('Данные успешно обновлены');
                const controller = new AbortController();
                const data = await fetchTableData(controller, router);
                setTableData(data);
            } else {
                console.error(data);
                toast.error('Ошибка при обновлении данных');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const createExcel = async () => {
        const apiPath = NEXT_PUBLIC_ENV === 'dev' ? 'http://localhost/api/vote/export_users_excel' : '/api/vote/export_users_excel';
        const res = await fetch(apiPath);
        if (res.status === 422) {
            router.push('/auth');
        }
        if (res.status === 200) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Выгрузка данных.xlsx';
            a.click();
        } else {
            console.error(res);
            toast.error('Произошла ошибка при выгрузке данных');
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
            if (!vote.valid_vote) {
                return null;
            }

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
                    <DatePicker
                        value={petitionState?.start_date}
                        onChange={(date) => {
                            setPetitionState((prev: any) => ({
                                ...prev,
                                start_date: date,
                            }));
                        }}
                    />
                    <DatePicker
                        value={petitionState?.end_date}
                        onChange={(date) => {
                            setPetitionState((prev: any) => ({
                                ...prev,
                                end_date: date,
                            }));
                        }}
                    />
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
                        value={petitionState?.status}
                        onValueChange={(status) => {
                            setPetitionState((prev: any) => ({
                                ...prev,
                                status,
                            }));
                        }}
                        options={PetitionStatusOptions}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <h2>
                    Количество голосов:
                    {' '}
                    {petitionState?.real_quantity}
                </h2>
                <div className="flex gap-4 items-center">
                    <Input
                        disabled={petitionState?.show_real}
                        type="number"
                        value={petitionState?.fake_quantity}
                        onChange={(e) => {
                            setPetitionState((prev: any) => ({
                                ...prev,
                                fake_quantity: Number.parseInt(e.target.value) || 0,
                            }));
                        }}
                        className="w-fit"
                    />
                    <Checkbox
                        checked={petitionState?.show_real}
                        onCheckedChange={(checked) => {
                            setPetitionState((prev: any) => ({
                                ...prev,
                                show_real: Boolean(checked),
                            }));
                        }}
                    />
                    <span>Использовать настоящее кол-во</span>
                </div>
            </div>

            <div>
                <Button onClick={updateVoting}>Сохранить</Button>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center w-full">
                    <h2 className="flex gap-4 items-center">
                        Собранные подписи
                        <Button onClick={createExcel}>Выгрузить в Excel</Button>
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
