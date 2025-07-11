'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { PetitionStatus, PetitionStatusOptions } from '@/enums';
import { Checkbox } from './ui/checkbox';
import { DataTable } from './ui/data-table';
import { DatePicker } from './ui/date-picker';
import { Input } from './ui/input';
import { ToggleExt } from './ui/toggle-ext';

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
}];

const demoData: any[] = [];

export function Dashboard() {
    const [useOgCount, setUseOgCount] = useState(true);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h2>
                    Дата начала и дата окончания сбора подписей
                </h2>
                <div className="flex gap-4">
                    <DatePicker />
                    <DatePicker />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <h2>
                    Статус петиции
                </h2>
                <div>
                    <ToggleExt type="single" variant="outline" value={PetitionStatus.ACTIVE.toString()} options={PetitionStatusOptions} />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <h2>
                    Количество голосов
                </h2>
                <div className="flex gap-4 items-center">
                    <Input disabled={useOgCount} type="number" className="w-fit" defaultValue={0} />
                    <Checkbox checked={useOgCount} onCheckedChange={(checked) => setUseOgCount(Boolean(checked))} />
                    <span>Использовать настоящее кол-во</span>
                </div>
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
