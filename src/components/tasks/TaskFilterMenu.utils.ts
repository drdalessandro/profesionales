// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { CodeableConcept, Patient, Reference, Task } from '@medplum/fhirtypes';

export type TaskFilterValue = Reference<Patient> | Reference | CodeableConcept | string;

export enum TaskFilterType {
  STATUS = 'status',
  OWNER = 'owner',
  PERFORMER_TYPE = 'performerType',
  PRIORITY = 'priority',
  PATIENT = 'patient',
}

export const TASK_STATUSES: Task['status'][] = [
  'draft',
  'requested',
  'received',
  'accepted',
  'rejected',
  'ready',
  'in-progress',
  'on-hold',
  'failed',
  'completed',
];

export const TASK_STATUS_LABELS: Partial<Record<Task['status'], string>> = {
  draft: 'Borrador',
  requested: 'Solicitado',
  received: 'Recibido',
  accepted: 'Aceptado',
  rejected: 'Rechazado',
  ready: 'Listo',
  'in-progress': 'En Progreso',
  'on-hold': 'En Espera',
  failed: 'Fallido',
  completed: 'Completado',
};

export const TASK_PRIORITIES: Task['priority'][] = ['routine', 'urgent', 'asap', 'stat'];

export const TASK_PRIORITY_LABELS: Record<NonNullable<Task['priority']>, string> = {
  routine: 'Rutina',
  urgent: 'Urgente',
  asap: 'A la Brevedad',
  stat: 'Inmediato',
};
