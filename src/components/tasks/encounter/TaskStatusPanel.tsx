// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { ActionIcon, Badge, Box, Flex, Menu, Text, Tooltip } from '@mantine/core';
import type { Task } from '@medplum/fhirtypes';
import { IconCheck, IconChevronDown, IconPencil } from '@tabler/icons-react';
import type { JSX } from 'react';

interface TaskStatusPanelProps {
  task: Task;
  enabled?: boolean;
  onActionButtonClicked: () => void;
  onChangeStatus: (status: Task['status']) => void;
}

export const TaskStatusPanel = (props: TaskStatusPanelProps): JSX.Element => {
  const { task, enabled = true, onActionButtonClicked, onChangeStatus } = props;
  const badgeColor = getBadgeColor(task.status);

  return (
    <Box p="md" style={{ borderTop: '1px solid #eee', margin: 0 }}>
      <Flex justify="space-between" align="center" w="100%" m={0}>
        <Flex align="center" gap={8}>
          <Text>Estado de la Tarea:</Text>
          {enabled ? (
            <Menu position="bottom-start">
              <Menu.Target>
                <Badge
                  variant="light"
                  color={badgeColor}
                  size="lg"
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0 }}
                  rightSection={<IconChevronDown size={16} />}
                >
                  {task.status.replaceAll('-', ' ').replaceAll(/\b\w/g, (char) => char.toUpperCase())}
                </Badge>
              </Menu.Target>
              <Menu.Dropdown style={{ width: 140 }}>
                {statuses.map((status) => (
                  <Menu.Item
                    key={status.value}
                    rightSection={
                      task.status === status.value ? (
                        <div style={{ marginLeft: 4, display: 'flex', alignItems: 'center' }}>
                          <IconCheck size={16} color="gray" />
                        </div>
                      ) : null
                    }
                    onClick={() => onChangeStatus(status.value as Task['status'])}
                  >
                    {status.label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Badge variant="light" color={badgeColor} size="lg">
              {task.status.replaceAll('-', ' ').replaceAll(/\b\w/g, (char) => char.toUpperCase())}
            </Badge>
          )}
        </Flex>
        {enabled && (
          <Tooltip label="Editar Tarea" openDelay={500}>
            <ActionIcon onClick={onActionButtonClicked} color="gray" variant="subtle" aria-label="Editar Tarea" size="lg">
              <IconPencil size={20} />
            </ActionIcon>
          </Tooltip>
        )}
      </Flex>
    </Box>
  );
};

const statuses = [
  { value: 'completed', label: 'Completada' },
  { value: 'ready', label: 'Lista' },
  { value: 'in-progress', label: 'En Progreso' },
  { value: 'on-hold', label: 'En Espera' },
  { value: 'cancelled', label: 'Cancelada' },
];

const getBadgeColor = (status: Task['status']): string => {
  const colors = { completed: 'green', cancelled: 'red' };
  return colors[status as keyof typeof colors] ?? 'blue';
};
