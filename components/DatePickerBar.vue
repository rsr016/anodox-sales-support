<template>
  <div class="flex justify-between mx-auto">
    <div class="content-center gap-1 grid auto-cols-auto auto-rows-min">
      <div class="content-center col-span-4">
        <p class="justify-self-left text-base text-gray-600">Início:</p>
      </div>
      <div class="">
        <UButton icon="i-heroicons-chevron-double-left" :ui="{ base: 'border p-3 rounded-md' }" @click="goToStart()" />
      </div>
      <div class="">
        <UPopover :popper="{ placement: 'bottom-start' }" :ui="{ base: 'bg-white z-50', }" overlay>
          <UButton icon="i-heroicons-calendar-days-20-solid" :label="format(dateRange.start, 'dd/MM/yyy')"
            :ui="{ base: 'border p-3 rounded-md' }" />

          <template #panel="{ close }">
            <DatePicker v-model="dateRange.start" is-required @close="close" :min-date="start"
              :max-date="dateRange.end" />
          </template>

        </UPopover>
        <p class="justify-self-center text-gray-500 text-xs">Mínimo {{ format(new Date(start), 'dd/MM/yyy') }}</p>
      </div>
      <div class="">
        <UButton icon="i-heroicons-chevron-right" label="1 Dia" :ui="{ base: 'border p-3 rounded-md' }" @click="oneDay" />
      </div>
      <div>
        <UButton icon="i-heroicons-chevron-right" label="1 Semana" :ui="{ base: 'border p-3 rounded-md' }" @click="oneWeek" />
      </div>
    </div>
    <div class="content-center gap-1 grid auto-cols-auto auto-rows-min">
      <div class="content-center col-span-2">
        <p class="justify-self-left text-base text-gray-600">Fim:</p>
      </div>
      <div class="">
        <UPopover :popper="{ placement: 'bottom-start' }" :ui="{ base: 'bg-white z-50', }" overlay>
          <UButton icon="i-heroicons-calendar-days-20-solid" :label="format(dateRange.end, 'dd/MM/yyy')"
            :ui="{ base: 'border p-3 rounded-md' }" />

          <template #panel="{ close }">
            <DatePicker v-model="dateRange.end" is-required @close="close" :min-date="dateRange.start"
              :max-date="end" />
          </template>
        </UPopover>
        <p class="justify-self-center text-gray-500 text-xs">Máximo {{ format(new Date(end), 'dd/MM/yyy') }}</p>
      </div>
      <div class="">
        <UButton icon="i-heroicons-chevron-double-right" :ui="{ base: 'border p-3 rounded-md' }" @click="goToEnd"/>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { DatePicker as VCalendarDatePicker } from 'v-calendar'
// @ts-ignore
import type { DatePickerDate, DatePickerRangeObject } from 'v-calendar/dist/types/src/use/datePicker'
import 'v-calendar/dist/style.css'
const appConfig = useAppConfig()
import { format } from 'date-fns'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  modelValue: {
    type: [Date, Object] as PropType<DatePickerDate | DatePickerRangeObject | null>,
    default: null
  },
  start: {
    type: [Number, Date] as PropType<DatePickerDate>,
    required: false,
  },
  end: {
    type: [Number, Date] as PropType<DatePickerDate>,
    required: false,
  }
})

const emit = defineEmits(['update:model-value', 'close'])

const dateRange = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:model-value', value)
    emit('close')
  }
})

const attrs = {
  'transparent': true,
  'borderless': true,
  'color': 'primary',
  'is-dark': { selector: 'html', darkClass: 'dark' },
  'first-day-of-week': 2
}

function goToEnd() {
  props.modelValue.end = new Date(props.end);
}

function goToStart() {
  props.modelValue.start = new Date(props.start);
}

function oneDay() {
  props.modelValue.end = addDays(props.modelValue.start, 1);
}

function oneWeek() {
  props.modelValue.end = addDays(props.modelValue.start, 7);
}

function addDays(date: Date, days: number) {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
}

function onDayClick(close: any, event: MouseEvent): void {
  const target = event.target as HTMLElement
  target.blur()
}
</script>

<style>
:root {
  --vc-gray-50: rgb(var(--color-gray-50));
  --vc-gray-100: rgb(var(--color-gray-100));
  --vc-gray-200: rgb(var(--color-gray-200));
  --vc-gray-300: rgb(var(--color-gray-300));
  --vc-gray-400: rgb(var(--color-gray-400));
  --vc-gray-500: rgb(var(--color-gray-500));
  --vc-gray-600: rgb(var(--color-gray-600));
  --vc-gray-700: rgb(var(--color-gray-700));
  --vc-gray-800: rgb(var(--color-gray-800));
  --vc-gray-900: rgb(var(--color-gray-900));
}

.vc-primary {
  --vc-accent-50: rgb(var(--color-primary-50));
  --vc-accent-100: rgb(var(--color-primary-100));
  --vc-accent-200: rgb(var(--color-primary-200));
  --vc-accent-300: rgb(var(--color-primary-300));
  --vc-accent-400: rgb(var(--color-primary-400));
  --vc-accent-500: rgb(var(--color-primary-500));
  --vc-accent-600: rgb(var(--color-primary-600));
  --vc-accent-700: rgb(var(--color-primary-700));
  --vc-accent-800: rgb(var(--color-primary-800));
  --vc-accent-900: rgb(var(--color-primary-900));
}
</style>
