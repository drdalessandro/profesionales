// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Alert, Button, Group, Loader, Stack, Switch, Text, Title, Tooltip } from '@mantine/core';
import type { WithId } from '@medplum/core';
import { deepClone, EMPTY, formatReferenceString, getExtensionValue, getReferenceString } from '@medplum/core';
import type { HealthcareService, Reference, Schedule } from '@medplum/fhirtypes';
import { Document, MedplumLink, useMedplum } from '@medplum/react';
import { useResource, useSearchResources } from '@medplum/react-hooks';
import { IconAlertCircle } from '@tabler/icons-react';
import type { JSX } from 'react';
import { Fragment, useState } from 'react';
import { useParams } from 'react-router';
import { AlphaBanner } from '../../components/AlphaBanner';
import { DocsLink } from '../../components/DocsLink';
import { showErrorNotification, showSuccessNotification } from '../../utils/notifications';
import { hasSchedulingParameters } from '../../utils/scheduling';
import { isCodeableReferenceLikeTo, ServiceTypeReferenceURI, toCodeableReferenceLike } from '../../utils/servicetype';

// Eventually we should paginate the HealthcareService search so this is not a
// hard limit. We expect that 1000 rows should be plenty for most providers, so
// temporarily shipping with a single large page fetch.
const MAX_PAGE_SIZE = 1000;

export function ScheduleSettings(props: { schedule: Schedule }): JSX.Element | null {
  const medplum = useMedplum();
  const [services, servicesLoading] = useSearchResources('HealthcareService', {
    _sort: 'name',
    _count: MAX_PAGE_SIZE.toString(),
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Store a copy of the Schedule that we can mutate while the viewer manipulates
  // the UI
  const [schedule, setSchedule] = useState(deepClone(props.schedule));

  if (servicesLoading) {
    return <Loader />;
  }

  if (!services?.length) {
    return (
      <Group>
        <Alert color="red" variant="outline">
          No se encontraron Servicios de Salud.
        </Alert>
      </Group>
    );
  }

  function toggleServiceType(service: WithId<HealthcareService>, enabled: boolean): void {
    setDirty(true);
    if (enabled) {
      const serviceType = toCodeableReferenceLike(service);
      setSchedule((prevValue) => ({
        ...prevValue,
        serviceType: [...(prevValue.serviceType ?? EMPTY), ...serviceType],
      }));
    } else {
      setSchedule((prevValue) => {
        const refString = getReferenceString(service);
        const serviceType = prevValue.serviceType?.filter((cc) => {
          const ref = getExtensionValue(cc, ServiceTypeReferenceURI) as Reference<HealthcareService> | undefined;
          return ref?.reference !== refString;
        });
        return { ...prevValue, serviceType };
      });
    }
  }

  async function submit(): Promise<void> {
    setSaving(true);
    try {
      const updated = await medplum.updateResource(schedule, {
        headers: {
          'If-Match': schedule.meta?.versionId ? `W/"${schedule.meta.versionId}"` : '',
        },
      });
      setSchedule(deepClone(updated));
      showSuccessNotification({ message: 'Agenda actualizada' });
      setDirty(false);
    } catch (err) {
      showErrorNotification(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Stack gap="lg">
      <Stack gap="0">
        <Title order={3}>Tipos de Turnos</Title>
        <Text fs="italic" c="dimmed">
          Elija qué tipos de turnos pueden programarse en este calendario. Más información sobre{' '}
          <DocsLink path="scheduling">cómo configurar la Agenda</DocsLink>.
        </Text>
      </Stack>
      {services.length >= MAX_PAGE_SIZE && (
        <Alert color="yellow" variant="outline" icon={<IconAlertCircle />}>
          Se alcanzó el límite de Servicios de Salud; es posible que algunas filas no se hayan cargado.
        </Alert>
      )}
      <Stack gap="sm">
        {services.map((service) => {
          const schedulable = hasSchedulingParameters(service);
          return (
            <Group key={service.id}>
              <Tooltip
                label={'Este Servicio de Salud no tiene la extensión SchedulingParameters'}
                disabled={schedulable}
                position="right"
                refProp="rootRef"
                withArrow
              >
                <Switch
                  label={service.name}
                  checked={isCodeableReferenceLikeTo(schedule.serviceType, service)}
                  onChange={(e) => toggleServiceType(service, e.target.checked)}
                  disabled={!schedulable}
                />
              </Tooltip>
            </Group>
          );
        })}
      </Stack>
      <Group justify="flex-end">
        <Button variant="outline" disabled={saving} component={MedplumLink} to={`/Calendar/Schedule/${schedule.id}`}>
          {dirty ? 'Cancelar' : 'Volver'}
        </Button>
        <Button disabled={!dirty} onClick={submit} loading={saving}>
          Guardar Cambios
        </Button>
      </Group>
    </Stack>
  );
}

export function ScheduleSettingsPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const schedule = useResource<Schedule>({ reference: `Schedule/${id}` });

  return (
    <Document>
      <Title order={1} mb="sm">
        Configuración de Agenda
        {schedule?.actor.map((actor, i) => (
          <Fragment key={actor.reference}>
            {i === 0 ? ' - ' : ', '}
            {formatReferenceString(actor)}
          </Fragment>
        ))}
      </Title>
      <AlphaBanner bdrs="md" mb="lg">
        La Agenda de Medplum se encuentra en período Alpha y puede estar sujeta a cambios.
      </AlphaBanner>
      {schedule ? <ScheduleSettings schedule={schedule} key={schedule.id} /> : <Loader />}
    </Document>
  );
}
