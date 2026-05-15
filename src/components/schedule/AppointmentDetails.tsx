// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Button, Group, Stack, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { createReference, formatHumanName, formatPeriod, isReference } from '@medplum/core';
import type { Appointment, Coding, Patient, PlanDefinition, Practitioner } from '@medplum/fhirtypes';
import { CodingInput, Form, MedplumLink, ResourceAvatar, ResourceInput, useMedplum } from '@medplum/react';
import { useResource } from '@medplum/react-hooks';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { createEncounter } from '../../utils/encounter';
import { showErrorNotification } from '../../utils/notifications';
import { PlanDefinitionSummary } from '../plandefinition/PlanDefinitionSummary';

type UpdateAppointmentFormProps = {
  appointment: Appointment;
  onUpdate: (appointment: Appointment) => void;
};

function UpdateAppointmentForm(props: UpdateAppointmentFormProps): JSX.Element {
  const medplum = useMedplum();
  const [patient, setPatient] = useState<Patient | undefined>(undefined);

  const { appointment, onUpdate } = props;
  const handleSubmit = useCallback(async () => {
    if (!patient) {
      return;
    }
    const updated = {
      ...appointment,
      participant: [
        ...appointment.participant,
        {
          actor: createReference(patient),
          status: 'tentative',
        },
      ],
    } satisfies Appointment;

    let result: Appointment;
    try {
      result = await medplum.updateResource(updated);
    } catch (error) {
      showErrorNotification(error);
      return;
    }
    onUpdate?.(result);
  }, [medplum, patient, appointment, onUpdate]);

  return (
    <Form onSubmit={handleSubmit}>
      <Stack gap="md">
        <ResourceInput
          label="Paciente"
          resourceType="Patient"
          name="Patient-id"
          required={true}
          onChange={(value) => setPatient(value as Patient)}
        />

        <Button fullWidth type="submit">
          Actualizar Turno
        </Button>
      </Stack>
    </Form>
  );
}

// This component is used when an appointment does not have a related Encounter
// that we can direct the viewer to. It allows us to show some details for
// appointments that are not fully configured and offer UI to complete set up.
//
// As one example, this can be used after a patient has scheduled an appointment
// via $find/$hold to set up an Encounter and apply a plan definition to it.
export function AppointmentDetails(props: {
  appointment: Appointment;
  onUpdate: (appointment: Appointment) => void;
}): JSX.Element {
  const medplum = useMedplum();
  const [planDefinition, setPlanDefinition] = useState<PlanDefinition | undefined>();
  const [encounterClass, setEncounterClass] = useState<Coding | undefined>();

  // Extract references to a Patient and a Practitioner from `Appointment.participants`; we expect
  // one of each.
  const participants = props.appointment.participant.map((p) => p.actor);
  const patientRef = participants.find((r) => isReference<Patient>(r, 'Patient'));
  const practitionerRef = participants.find((r) => isReference<Practitioner>(r, 'Practitioner'));

  const patient = useResource(patientRef);
  const navigate = useNavigate();

  const handleSubmit = useCallback(async () => {
    if (!patient) {
      showNotification({
        color: 'yellow',
        icon: <IconAlertSquareRounded />,
        title: 'Error',
        message: 'Paciente no cargado',
      });
      return;
    }

    if (!practitionerRef) {
      showNotification({
        color: 'yellow',
        icon: <IconAlertSquareRounded />,
        title: 'Error',
        message: 'El turno no tiene un Profesional participante',
      });
      return;
    }

    if (!encounterClass || !planDefinition) {
      showNotification({
        color: 'yellow',
        icon: <IconAlertSquareRounded />,
        title: 'Error',
        message: 'Por favor complete los campos requeridos.',
      });
      return;
    }

    try {
      const encounter = await createEncounter(
        medplum,
        encounterClass,
        patient,
        planDefinition,
        props.appointment,
        practitionerRef
      );

      navigate(`/Patient/${patient.id}/Encounter/${encounter.id}`)?.catch(console.error);
    } catch (err) {
      showErrorNotification(err);
    }
  }, [medplum, patient, encounterClass, planDefinition, props.appointment, navigate, practitionerRef]);

  return (
    <Stack gap="md">
      <Text size="lg">{formatPeriod({ start: props.appointment.start, end: props.appointment.end })}</Text>

      {!patientRef && <UpdateAppointmentForm appointment={props.appointment} onUpdate={props.onUpdate} />}

      {!!patient && (
        <>
          <Group align="center" gap="sm">
            <MedplumLink to={patient}>
              <ResourceAvatar value={patient} size={48} radius={48} />
            </MedplumLink>
            <MedplumLink to={patient} fw={800} size="lg">
              {formatHumanName(patient.name?.[0])}
            </MedplumLink>
          </Group>
          <div>
            <h3>Configurar Encuentro</h3>
            <Form onSubmit={handleSubmit}>
              <Stack gap="md">
                <ResourceInput<Practitioner>
                  name="practitioner"
                  resourceType="Practitioner"
                  label="Profesional"
                  defaultValue={practitionerRef}
                  disabled={true}
                  required={true}
                />

                <CodingInput
                  name="class"
                  label="Clase de Encuentro"
                  binding="http://terminology.hl7.org/ValueSet/v3-ActEncounterCode"
                  required={true}
                  onChange={setEncounterClass}
                  path="Encounter.type"
                />

                <ResourceInput<PlanDefinition>
                  name="plandefinition"
                  resourceType="PlanDefinition"
                  label="Plantilla de atención"
                  onChange={setPlanDefinition}
                  required={true}
                />

                <PlanDefinitionSummary planDefinition={planDefinition} />

                <Button fullWidth type="submit" disabled={!planDefinition || !encounterClass}>
                  Aplicar
                </Button>
              </Stack>
            </Form>
          </div>
        </>
      )}
    </Stack>
  );
}
