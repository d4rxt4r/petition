export enum PetitionStatus {
    ACTIVE = 'Сбор подписей',
    PENDING = 'На проверке',
    SIGNED = 'Принято',
    REJECTED = 'Не принято',
}

export const StatusText = {
    [PetitionStatus.ACTIVE]: 'Сбор подписей — важный этап продвижения петиции. Он показывает, сколько людей поддерживают инициативу. Подписи можно собирать как в электронном виде, так и на бумаге. Чем больше подписей — тем выше шанс, что петицию рассмотрят и примут меры',
    [PetitionStatus.PENDING]: 'После отправки на согласование петиция проходит проверку на  соответствие требованиям. Затем её рассматривают ответственные органы, которые могут одобрить, отклонить или вернуть на доработку. Статус петиции можно отслеживать на сайте.',
    [PetitionStatus.SIGNED]: 'Принятие петиции означает, что она прошла все этапы рассмотрения и была одобрена ответственными органами. Это может привести к началу разработки законопроекта, изменению правил или другим действиям в ответ на поднятую проблему.',
    [PetitionStatus.REJECTED]: 'Если петиция не была принята, это означает, что по результатам рассмотрения компетентные органы не поддержали инициативу. Официальный ответ властей можно посмотреть по ссылке.',
};

export const PetitionStatusOptions = [{
    key: PetitionStatus.ACTIVE.toString(),
    value: PetitionStatus.ACTIVE.toString(),
    label: 'Сбор подписей',
}, {
    key: PetitionStatus.PENDING.toString(),
    value: PetitionStatus.PENDING.toString(),
    label: 'На согласовании',
}, {
    key: PetitionStatus.SIGNED.toString(),
    value: PetitionStatus.SIGNED.toString(),
    label: 'Принята',
}, {
    key: PetitionStatus.REJECTED.toString(),
    value: PetitionStatus.REJECTED.toString(),
    label: 'Не принята',
}];

export enum Language {
    RU = 'ru',
    RO = 'ro',
}
