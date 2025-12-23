'use client';

import * as React from 'react';
import { GripVerticalIcon } from 'lucide-react';
import * as ResizablePrimitive from 'react-resizable-panels';
import { cn } from '@/lib/utils';

/**
 * Compat layer:
 * - beberapa versi export: PanelGroup / Group
 * - beberapa versi export: PanelResizeHandle / ResizeHandle
 */
const PrimitivePanelGroup =
  (ResizablePrimitive as any).PanelGroup ?? (ResizablePrimitive as any).Group;

const PrimitivePanel = (ResizablePrimitive as any).Panel;

const PrimitiveResizeHandle =
  (ResizablePrimitive as any).PanelResizeHandle ?? (ResizablePrimitive as any).ResizeHandle;

function invariant(ok: any, message: string) {
  if (!ok) throw new Error(message);
}

export function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<any> & { className?: string }) {
  invariant(
    PrimitivePanelGroup,
    '[resizable] Tidak menemukan PanelGroup/Group dari react-resizable-panels. Cek versi package.'
  );

  return (
    <PrimitivePanelGroup
      data-slot="resizable-panel-group"
      className={cn('flex h-full w-full data-[panel-group-direction=vertical]:flex-col', className)}
      {...props}
    />
  );
}

export function ResizablePanel(props: React.ComponentProps<any>) {
  invariant(
    PrimitivePanel,
    '[resizable] Tidak menemukan Panel dari react-resizable-panels. Cek versi package.'
  );

  return <PrimitivePanel data-slot="resizable-panel" {...props} />;
}

export function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<any> & { withHandle?: boolean; className?: string }) {
  invariant(
    PrimitiveResizeHandle,
    '[resizable] Tidak menemukan PanelResizeHandle/ResizeHandle dari react-resizable-panels. Cek versi package.'
  );

  return (
    <PrimitiveResizeHandle
      data-slot="resizable-handle"
      className={cn(
        'bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90',
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </PrimitiveResizeHandle>
  );
}
