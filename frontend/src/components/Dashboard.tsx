'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { PetitionStatus, PetitionStatusOptions } from '@/enums';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { DataTable } from './ui/data-table';
import { DatePicker } from './ui/date-picker';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ToggleExt } from './ui/toggle-ext';

const demoData: any[] = [];

export function Dashboard() {
    const [startDate, setStartDate] = useState<Date | undefined>(() => new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(() => new Date());

    const [status, setStatus] = useState(PetitionStatus.ACTIVE.toString());

    const [count, setCount] = useState(0);
    const [useRealCount, setUseRealCount] = useState(false);

    const updateVoting = async () => {
        console.log(startDate, endDate, status, count, useRealCount);
    };

    const onRemove = async (voteId: number) => {
        console.log(voteId);
    };

    const columns: ColumnDef<any>[] = [{
        accessorKey: 'firstName',
        header: 'Имя',
    }, {
        accessorKey: 'lastName',
        header: 'Фамилия',
    }, {
        accessorKey: 'patronymic',
        header: 'Отчество',
    }, {
        accessorKey: 'phone',
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
                                Удалить запись?
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
                <h2>
                    Собранные подписи
                </h2>
                <div>
                    <DataTable columns={columns} data={demoData} />
                </div>
            </div>
        </div>
    );
}
