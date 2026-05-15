// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Card, Stack, Text } from '@mantine/core';
import { createReference } from '@medplum/core';
import type { Encounter, Practitioner } from '@medplum/fhirtypes';
import { DateTimeInput, ResourceInput } from '@medplum/react';
import type { JSX } from 'react';

interface VisitDetailsPanelProps {
  practitioner?: Practitioner;
  encounter: Encounter;
  onEncounterChange: (encounter: Encounter) => void;
}

export const VisitDetailsPanel = (props: VisitDetailsPanelProps): JSX.Element => {
  const { practitioner, encounter, onEncounterChange } = props;

  const handlePractitionerChange = async (practitioner: Practitioner | undefined): Promise<void> => {
    if (!encounter || !practitioner) {
      return;
    }

    const updatedEncounter = {
      ...encounter,
      participant: [
        {
          individual: createReference(practitioner),
        },
      ],
    };

    onEncounterChange(updatedEncounter);
  };

  const handleCheckinChange = async (checkin: string): Promise<void> => {
    if (!encounter || !checkin) {
      return;
    }

    const updatedEncounter = {
      ...encounter,
      period: {
        start: checkin,
      },
    };

    onEncounterChange(updatedEncounter);
  };

  const handleCheckoutChange = async (checkout: string): Promise<void> => {
    if (!encounter || !checkout) {
      return;
    }

    const updatedEncounter = {
      ...encounter,
      period: {
        end: checkout,
      },
    };

    onEncounterChange(updatedEncounter);
  };

  return (
    <Stack gap={0}>
      <Text fw={600} size="lg" mb="md">
        Detalles de la Consulta
      </Text>
      <Card withBorder shadow="sm" p="md">
        <Stack gap="md">
          <ResourceInput
            resourceType="Practitioner"
            name="practitioner"
            label="Profesional"
            placeholder="Buscar profesional"
            defaultValue={practitioner}
            onChange={handlePractitionerChange}
          />

          <DateTimeInput
            name="checkin"
            label="Entrada"
            defaultValue={encounter.period?.start}
            onChange={handleCheckinChange}
          />

          <DateTimeInput
            name="checkout"
            label="Salida"
            defaultValue={encounter.period?.end}
            onChange={handleCheckoutChange}
          />
        </Stack>
      </Card>
    </Stack>
  );
};
