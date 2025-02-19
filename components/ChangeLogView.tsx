"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ChangeLogEntry } from "@/types/event"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChangeLogViewProps {
  logs: ChangeLogEntry[]
}

const actionColors = {
  create: "bg-green-500",
  update: "bg-blue-500",
  delete: "bg-red-500",
  duplicate: "bg-purple-500",
}

const actionLabels = {
  create: "Creación",
  update: "Actualización",
  delete: "Eliminación",
  duplicate: "Duplicación",
}

export function ChangeLogView({ logs }: ChangeLogViewProps) {
  return (
    <ScrollArea className="h-[400px] rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Fecha</TableHead>
            <TableHead className="w-[100px]">Acción</TableHead>
            <TableHead className="w-[150px]">Campo</TableHead>
            <TableHead>Cambios</TableHead>
            <TableHead className="w-[150px]">Usuario</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">
                {format(new Date(log.timestamp), "PPp", { locale: es })}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={`${actionColors[log.action]} text-white`}
                >
                  {actionLabels[log.action]}
                </Badge>
              </TableCell>
              <TableCell>{log.field || "-"}</TableCell>
              <TableCell>
                {log.action === "update" ? (
                  <div className="text-sm">
                    <div className="text-muted-foreground">
                      Anterior: {JSON.stringify(log.oldValue)}
                    </div>
                    <div>
                      Nuevo: {JSON.stringify(log.newValue)}
                    </div>
                  </div>
                ) : log.action === "create" ? (
                  "Evento creado"
                ) : log.action === "delete" ? (
                  "Evento eliminado"
                ) : (
                  "Evento duplicado"
                )}
              </TableCell>
              <TableCell>{log.userName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
} 