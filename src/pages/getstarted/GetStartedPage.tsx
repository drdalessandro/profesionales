// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Group,
  List,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { convertToTransactionBundle } from '@medplum/core';
import type { Bundle, BundleEntry } from '@medplum/fhirtypes';
import { MedplumLink, useMedplum } from '@medplum/react';
import {
  IconApps,
  IconArrowUpRight,
  IconBook,
  IconBrandDiscord,
  IconBuilding,
  IconDatabase,
  IconDownload,
  IconExternalLink,
  IconFileText,
  IconHelpCircle,
  IconMail,
  IconMedicalCross,
  IconUser,
} from '@tabler/icons-react';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';
import patientBundleData from '../../data/patient-david-james-williams.json';
import visitBundleData from '../../data/simple-initial-visit-bundle.json';
import { showErrorNotification } from '../../utils/notifications';
import classes from './GetStartedPage.module.css';

export function GetStartedPage(): JSX.Element {
  const medplum = useMedplum();
  const [importingPatient, setImportingPatient] = useState(false);
  const [importingVisit, setImportingVisit] = useState(false);
  const [importingIcd10, setImportingIcd10] = useState(false);

  const handleImportPatient = useCallback(async () => {
    setImportingPatient(true);
    try {
      // Convert searchset bundle to transaction bundle
      const transactionBundle = convertToTransactionBundle(patientBundleData as Bundle);
      const result = await medplum.executeBatch(transactionBundle);

      const resourceCount =
        result.entry?.filter((entry: BundleEntry) => entry.response?.status?.startsWith('2')).length || 0;

      showNotification({
        color: 'green',
        title: 'Éxito',
        message: `Se importaron ${resourceCount} recursos para el paciente David James Williams`,
      });
    } catch (error) {
      showErrorNotification(error);
    } finally {
      setImportingPatient(false);
    }
  }, [medplum]);

  const handleImportVisit = useCallback(async () => {
    setImportingVisit(true);
    try {
      // The visit bundle is already a transaction bundle
      const result = await medplum.executeBatch(visitBundleData as Bundle);

      const resourceCount =
        result.entry?.filter((entry: BundleEntry) => entry.response?.status?.startsWith('2')).length || 0;

      showNotification({
        color: 'green',
        title: 'Éxito',
        message: `Se importaron ${resourceCount} recursos para la plantilla Simple Initial Visit`,
      });
    } catch (error) {
      showErrorNotification(error);
    } finally {
      setImportingVisit(false);
    }
  }, [medplum]);

  const handleImportIcd10 = useCallback(async () => {
    setImportingIcd10(true);
    try {
      await medplum.upsertResource(
        {
          resourceType: 'ValueSet',
          status: 'active',
          url: 'http://hl7.org/fhir/sid/icd-10-cm/vs/billable',
          title: 'ICD-10-CM Billable Codes',
          name: 'icd10cm-billable',
          compose: {
            include: [
              {
                system: 'http://hl7.org/fhir/sid/icd-10-cm',
                filter: [{ property: 'tty', op: '=', value: 'PT' }],
              },
            ],
          },
        },
        { url: 'http://hl7.org/fhir/sid/icd-10-cm/vs/billable' }
      );
      showNotification({ color: 'green', title: 'Éxito', message: 'ValueSet de Códigos Facturables ICD-10-CM listo' });
    } catch (error) {
      showErrorNotification(error);
    } finally {
      setImportingIcd10(false);
    }
  }, [medplum]);

  const integrations = [
    { src: '/img/integrations/labcorp.png', alt: 'Labcorp', left: 20, top: 20, zIndex: 1, rotation: -2 },
    { src: '/img/integrations/quest.png', alt: 'Quest Diagnostics', left: 70, top: 0, zIndex: 2, rotation: 2 },
    { src: '/img/integrations/candid.png', alt: 'Candid Health', left: 115, top: 30, zIndex: 3, rotation: -1 },
    { src: '/img/integrations/okta.png', alt: 'Okta', left: 165, top: 10, zIndex: 4, rotation: 1 },
    { src: '/img/integrations/epic.png', alt: 'Epic Systems', left: 210, top: 40, zIndex: 5, rotation: -1.5 },
    { src: '/img/integrations/healthgorilla.png', alt: 'Health Gorilla', left: 260, top: 5, zIndex: 6, rotation: 1.5 },
  ];

  return (
    <Box className={classes.page} py="6rem">
      <Container size="md" className={classes.container}>
        {/* Header */}
        <Box mb="6rem">
          <Title order={2} fw={800}>
            Comenzar con Medplum Provider
          </Title>
          <Text size="lg" mt=".25rem" className={classes.textSecondary}>
            A continuación encontrará los primeros pasos recomendados para familiarizarse con las funcionalidades y flujos de trabajo disponibles en Provider. Nota: si utiliza la versión gratuita de Provider, algunos servicios pueden no estar disponibles—los pedidos de laboratorio, recetas, facturación y acceso a sistemas de códigos (como CPT e ICD-10) requieren un plan de pago.{' '}
            <Text
              component="a"
              href="https://www.medplum.com/pricing"
              target="_blank"
              c="blue.6"
              className={classes.link}
              span
            >
              Suscribirse
            </Text>{' '}
            o{' '}
            <Text component="a" href="mailto:support@medplum.com" c="blue.6" className={classes.link} span>
              contáctenos
            </Text>{' '}
            para integrar estos servicios.
          </Text>
        </Box>

        <Stack gap="6rem">
          {/* Sample Data */}
          <Box>
            <Group mb="xl" gap="sm" align="center">
              <ActionIcon size={48} radius="xl" variant="light" className={classes.sectionIcon}>
                <IconDatabase size={24} color="white" />
              </ActionIcon>
              <Stack gap={0} className={classes.flexOne}>
                <Text fw={800} size="xl">
                  Importar Datos de Ejemplo
                </Text>
                <Text size="sm" className={classes.textSecondary}>
                  Agregue datos de ejemplo para pacientes, consultas y más para practicar.
                </Text>
              </Stack>
            </Group>
            <Box className={classes.sampleDataGrid}>
              <Paper radius="md" withBorder p="lg" shadow="sm" className={classes.card}>
                <Stack gap="md" className={classes.flexOne}>
                  <Group gap="sm" align="center">
                    <IconUser size={24} color="var(--icon-secondary)" />
                    <Stack gap={0}>
                      <Text size="11px" fw={500} className={classes.textLabel}>
                        Paciente de Ejemplo
                      </Text>
                      <Text fw={600} size="lg">
                        David James Williams
                      </Text>
                    </Stack>
                  </Group>
                  <Divider />
                  <Text size="md" className={classes.textSecondary} mb="sm" style={{ flex: 1 }}>
                    Incluye un paciente de ejemplo con datos demográficos e información clínica básica.
                  </Text>
                </Stack>
                <Button
                  variant="filled"
                  size="sm"
                  fullWidth
                  onClick={handleImportPatient}
                  loading={importingPatient}
                  disabled={importingPatient}
                  leftSection={<IconDownload size={14} />}
                  mt="sm"
                >
                  {importingPatient ? 'Importando...' : 'Importar Paciente'}
                </Button>
              </Paper>
              <Paper radius="md" withBorder p="lg" shadow="sm" className={classes.card}>
                <Stack gap="md" className={classes.flexOne}>
                  <Group gap="sm" align="center">
                    <IconFileText size={24} color="var(--icon-secondary)" />
                    <Stack gap={0}>
                      <Text size="11px" fw={500} className={classes.textLabel}>
                        Plantilla de Atención de Ejemplo
                      </Text>
                      <Text fw={600} size="lg">
                        Simple Initial Visit
                      </Text>
                    </Stack>
                  </Group>
                  <Divider />
                  <Text size="md" className={classes.textSecondary} style={{ flex: 1 }}>
                    Una plantilla de nota simple para la primera consulta del paciente que incluye tareas y cuestionarios.
                  </Text>
                  <Text size="xs" c="dimmed" mb="sm">
                    Nota: se requiere una Plantilla de Atención (recurso FHIR PlanDefinition) para crear consultas.
                  </Text>
                </Stack>
                <Button
                  variant="filled"
                  size="sm"
                  fullWidth
                  onClick={handleImportVisit}
                  loading={importingVisit}
                  disabled={importingVisit}
                  leftSection={<IconDownload size={14} />}
                  mt="sm"
                >
                  {importingVisit ? 'Importando...' : 'Importar Plantilla de Atención'}
                </Button>
              </Paper>
              <Paper radius="md" withBorder p="lg" shadow="sm" className={classes.card}>
                <Stack gap="md" className={classes.flexOne}>
                  <Group gap="sm" align="center">
                    <IconMedicalCross size={24} color="var(--icon-secondary)" />
                    <Stack gap={0}>
                      <Text size="11px" fw={500} className={classes.textLabel}>
                        Sistema de Códigos
                      </Text>
                      <Text fw={600} size="lg">
                        ICD-10-CM Billable Codes
                      </Text>
                    </Stack>
                  </Group>
                  <Divider />
                  <Text size="md" className={classes.textSecondary} mb="sm" style={{ flex: 1 }}>
                    Registra el ValueSet de códigos facturables ICD-10-CM utilizado para la búsqueda de códigos diagnósticos.
                  </Text>
                </Stack>
                <Button
                  variant="filled"
                  size="sm"
                  fullWidth
                  onClick={handleImportIcd10}
                  loading={importingIcd10}
                  disabled={importingIcd10}
                  leftSection={<IconDownload size={14} />}
                  mt="sm"
                >
                  {importingIcd10 ? 'Importando...' : 'Importar ValueSet'}
                </Button>
              </Paper>
              <Paper radius="md" withBorder p="lg" shadow="sm" className={classes.card}>
                <Stack gap="md" className={classes.flexOne}>
                  <Group gap="sm" align="center">
                    <IconBuilding size={24} color="var(--icon-secondary)" />
                    <Stack gap={0}>
                      <Text size="11px" fw={500} className={classes.textLabel}>
                        Demo de Práctica
                      </Text>
                      <Text fw={600} size="lg">
                        Full Practice Demo
                      </Text>
                    </Stack>
                  </Group>
                  <Divider />
                  <Text size="md" className={classes.textSecondary} mb="sm" style={{ flex: 1 }}>
                    Conjunto de datos completo con pacientes, profesionales y agendas.
                  </Text>
                </Stack>
                <Button variant="outline" size="sm" fullWidth disabled mt="sm">
                  Próximamente
                </Button>
              </Paper>
              <Paper radius="md" withBorder p="lg" shadow="sm" className={classes.card}>
                <Stack gap="md" className={classes.flexOne}>
                  <Group gap="sm" align="center">
                    <IconBuilding size={24} color="var(--icon-secondary)" />
                    <Stack gap={0}>
                      <Text size="11px" fw={500} className={classes.textLabel}>
                        Organización
                      </Text>
                      <Text fw={600} size="lg">
                        Sample Organization
                      </Text>
                    </Stack>
                  </Group>
                  <Divider />
                  <Text size="md" className={classes.textSecondary} mb="sm" style={{ flex: 1 }}>
                    Datos de organización de ejemplo con profesionales y ubicaciones.
                  </Text>
                </Stack>
                <Button variant="outline" size="sm" fullWidth disabled mt="sm">
                  Próximamente
                </Button>
              </Paper>
            </Box>
          </Box>

          {/* Integrate Your Services */}
          <Box>
            <Group mb="xl" gap="sm" align="center">
              <ActionIcon size={48} radius="xl" variant="light" className={classes.sectionIcon}>
                <IconApps size={24} color="white" />
              </ActionIcon>
              <Stack gap={0} className={classes.flexOne}>
                <Text fw={800} size="xl">
                  Integrar Sus Servicios
                </Text>
                <Text size="sm" className={classes.textSecondary}>
                  Contáctenos para conectar servicios existentes o configurar nuevos.
                </Text>
              </Stack>
            </Group>
            <Paper radius="md" withBorder p="md" shadow="sm">
              <Grid gutter="lg" align="center">
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Box className={classes.integrationsContainer}>
                    <Box className={classes.integrationsInner}>
                      {integrations.map((integration) => (
                        <Box
                          key={integration.src}
                          className={classes.integrationCard}
                          style={{
                            left: integration.left,
                            top: integration.top,
                            zIndex: integration.zIndex,
                            transform: `rotate(${integration.rotation}deg)`,
                          }}
                        >
                          <img src={integration.src} alt={integration.alt} className={classes.integrationImage} />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Stack gap="md" style={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
                    <Box>
                      <Text size="sm" my="md">
                        Integre con socios para…
                      </Text>
                      <List size="sm" spacing="0">
                        <List.Item>
                          <Text span size="sm" fw={600}>
                            Laboratorios:
                          </Text>{' '}
                          Labcorp, Quest, & Health Gorilla
                        </List.Item>
                        <List.Item>
                          <Text span size="sm" fw={600}>
                            Farmacias:
                          </Text>{' '}
                          Surescripts & DoseSpot
                        </List.Item>
                        <List.Item>
                          <Text span size="sm" fw={600}>
                            Facturación:
                          </Text>{' '}
                          Candid Health & Stedi
                        </List.Item>
                        <List.Item>
                          <Text span size="sm" fw={600}>
                            Utilidades:
                          </Text>{' '}
                          eFax, OpenAI, Okta, and more
                        </List.Item>
                      </List>
                    </Box>
                    <Box mb="sm">
                      <MedplumLink to="/integrations" c="blue" fw={500}>
                        Ver Todas las Integraciones →
                      </MedplumLink>
                    </Box>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Paper>
          </Box>

          {/* How to Use Provider */}
          <Box>
            <Group mb="xl" gap="sm" align="center">
              <ActionIcon size={48} radius="xl" variant="light" className={classes.sectionIcon}>
                <IconBook size={24} color="white" />
              </ActionIcon>
              <Stack gap={0} className={classes.flexOne}>
                <Text fw={800} size="xl">
                  Ver Guía de Usuario
                </Text>
                <Text size="sm" className={classes.textSecondary}>
                  Siga la documentación paso a paso para aprovechar al máximo Medplum Provider.
                </Text>
              </Stack>
            </Group>
            <Paper radius="md" withBorder shadow="sm" p={0} style={{ overflow: 'hidden' }}>
              <Grid gutter={0}>
                {/* Getting Started */}
                <Grid.Col span={{ base: 12, sm: 6 }} className={classes.gridCell}>
                  <Box p="lg" className={classes.gridCellContent}>
                    <Box className={classes.dividerRight} />
                    <Box className={classes.dividerBottom} />
                    <Text
                      component="a"
                      href="https://www.medplum.com/docs/provider/getting-started"
                      target="_blank"
                      fw={600}
                      size="lg"
                      className={classes.sectionTitle}
                      mb="xs"
                    >
                      Agregar Profesionales y Datos <IconArrowUpRight size={16} style={{ verticalAlign: 'middle' }} />
                    </Text>
                    <List size="md" spacing={2} className={classes.flexOne} c="blue">
                      <List.Item>
                        <Text
                          component="a"
                          href="https://www.medplum.com/docs/provider/getting-started#adding-practitioners"
                          target="_blank"
                          c="blue"
                          className={classes.link}
                        >
                          Agregar Profesionales
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text
                          component="a"
                          href="https://www.medplum.com/docs/provider/getting-started#importing-data"
                          target="_blank"
                          c="blue"
                          className={classes.link}
                        >
                          Importar Datos
                        </Text>
                      </List.Item>
                    </List>
                  </Box>
                </Grid.Col>

                {/* Patient Profile */}
                <Grid.Col span={{ base: 12, sm: 6 }} className={classes.gridCell}>
                  <Box p="lg" className={classes.gridCellContent}>
                    <Box className={classes.dividerBottom} />
                    <Text
                      component="a"
                      href="https://www.medplum.com/docs/provider/patient-profile"
                      target="_blank"
                      fw={600}
                      size="lg"
                      className={classes.sectionTitle}
                      mb="xs"
                    >
                      Perfil del Paciente <IconArrowUpRight size={16} style={{ verticalAlign: 'middle' }} />
                    </Text>
                    <List size="md" spacing={2} className={classes.flexOne} c="blue">
                      <List.Item>
                        <Text
                          component="a"
                          href="https://www.medplum.com/docs/provider/patient-profile#registering-patients"
                          target="_blank"
                          c="blue"
                          className={classes.link}
                        >
                          Registrar Pacientes
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text
                          component="a"
                          href="https://www.medplum.com/docs/provider/patient-profile#editing-patient-demographics"
                          target="_blank"
                          c="blue"
                          className={classes.link}
                        >
                          Editar Datos Demográficos del Paciente
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text
                          component="a"
                          href="https://www.medplum.com/docs/provider/patient-profile#updating-the-patient-summary-sidebar"
                          target="_blank"
                          c="blue"
                          className={classes.link}
                        >
                          Actualizar Resumen del Paciente
                        </Text>
                      </List.Item>
                    </List>
                  </Box>
                </Grid.Col>

                {/* Schedule */}
                <Grid.Col span={{ base: 12, sm: 6 }} className={classes.gridCell}>
                  <Box p="lg" className={classes.gridCellContent}>
                    <Box className={classes.dividerRight} />
                    <Text
                      component="a"
                      href="https://www.medplum.com/docs/provider/schedule"
                      target="_blank"
                      fw={600}
                      size="lg"
                      className={classes.sectionTitle}
                      mb="xs"
                    >
                      Agenda <IconArrowUpRight size={16} style={{ verticalAlign: 'middle' }} />
                    </Text>
                    <List size="sm" spacing={2} className={classes.flexOne} c="blue">
                      <List.Item>
                        <Text
                          component="a"
                          href="https://www.medplum.com/docs/provider/schedule#scheduling-a-visit"
                          target="_blank"
                          c="blue"
                          className={classes.link}
                        >
                          Programar una Consulta
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text
                          component="a"
                          href="https://www.medplum.com/docs/provider/schedule#setting-provider-availability"
                          target="_blank"
                          c="blue"
                          className={classes.link}
                        >
                          Configurar Disponibilidad del Profesional
                        </Text>
                      </List.Item>
                    </List>
                  </Box>
                </Grid.Col>

                {/* Visits */}
                <Grid.Col span={{ base: 12, sm: 6 }} className={classes.gridCell}>
                  <Box p="lg" className={classes.gridCellContent}>
                    <Text
                      component="a"
                      href="https://www.medplum.com/docs/provider/visits"
                      target="_blank"
                      fw={600}
                      size="lg"
                      className={classes.sectionTitle}
                      mb="xs"
                    >
                      Consultas <IconArrowUpRight size={16} style={{ verticalAlign: 'middle' }} />
                    </Text>
                    <List size="sm" spacing={2} className={classes.flexOne} c="blue">
                      <List.Item>
                        <Text
                          component="a"
                          href="https://www.medplum.com/docs/provider/visits#understanding-visits"
                          target="_blank"
                          c="blue"
                          className={classes.link}
                        >
                          Comprender las Consultas
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text
                          component="a"
                          href="https://www.medplum.com/docs/provider/visits#documenting-visits"
                          target="_blank"
                          c="blue"
                          className={classes.link}
                        >
                          Documentar Consultas
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text
                          component="a"
                          href="https://www.medplum.com/docs/provider/visits#setting-up-care-templates-via-medplum-app"
                          target="_blank"
                          c="blue"
                          className={classes.link}
                        >
                          Configurar Plantillas de Atención
                        </Text>
                      </List.Item>
                    </List>
                  </Box>
                </Grid.Col>
              </Grid>
            </Paper>
          </Box>

          {/* Further Support */}
          <Box>
            <Group mb="xl" gap="sm" align="center">
              <ActionIcon size={48} radius="xl" variant="light" className={classes.sectionIcon}>
                <IconHelpCircle size={24} color="white" />
              </ActionIcon>
              <Stack gap={0} className={classes.flexOne}>
                <Text fw={800} size="xl">
                  Obtener Ayuda
                </Text>
                <Text size="sm" className={classes.textSecondary}>
                  Únase a nuestra comunidad para discusiones, o contacte nuestro equipo para soporte.
                </Text>
              </Stack>
            </Group>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }} className={classes.gridCell}>
                <Paper radius="md" withBorder p="lg" shadow="sm" className={classes.helpCard}>
                  <Stack gap="md" className={classes.flexOne}>
                    <Group gap="sm" align="center">
                      <IconBrandDiscord size={24} color="var(--icon-secondary)" />
                      <Text fw={600} size="lg">
                        Comunidad en Discord
                      </Text>
                    </Group>
                    <Divider />
                    <Text size="md" className={classes.textSecondary} mb="sm" style={{ flex: 1 }}>
                      Únase a nuestra comunidad activa para preguntas y discusiones.
                    </Text>
                  </Stack>
                  <Button
                    component="a"
                    href="https://discord.gg/medplum"
                    target="_blank"
                    variant="filled"
                    size="sm"
                    mt="sm"
                    fullWidth
                    rightSection={<IconExternalLink size={14} />}
                  >
                    Unirse al Discord de Medplum
                  </Button>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }} className={classes.gridCell}>
                <Paper radius="md" withBorder p="lg" shadow="sm" className={classes.helpCard}>
                  <Stack gap="md" className={classes.flexOne}>
                    <Group gap="sm" align="center">
                      <IconMail size={24} color="var(--icon-secondary)" />
                      <Text fw={600} size="lg">
                        Contáctenos
                      </Text>
                    </Group>
                    <Divider />
                    <Text size="md" className={classes.textSecondary} mb="sm" style={{ flex: 1 }}>
                      Comuníquese para preguntas sobre el producto, comentarios o soporte empresarial.
                    </Text>
                  </Stack>
                  <Button
                    component="a"
                    href="mailto:support@medplum.com"
                    variant="filled"
                    size="sm"
                    mt="sm"
                    fullWidth
                    rightSection={<IconExternalLink size={14} />}
                  >
                    Contactar Soporte
                  </Button>
                </Paper>
              </Grid.Col>
            </Grid>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
