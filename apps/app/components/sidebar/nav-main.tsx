'use client';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@deepcrawl/ui/components/ui/sidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import type { NavigationItem } from '@/lib/navigation-config';

export function NavMain({ items }: { items: NavigationItem[] }) {
  const router = useRouter();

  const handleHoverToPrefetch = (url: string) => {
    router.prefetch(url);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item, index) => (
            <React.Fragment key={`${item.title}-${index}`}>
              {item.label && (
                <SidebarGroupLabel className="group-has-data-[collapsible=icon]/sidebar-wrapper:-z-50 group-has-data-[collapsible=icon]/sidebar-wrapper:select-none">
                  {item.label}
                </SidebarGroupLabel>
              )}
              <SidebarMenuItem
                key={item.title}
                onFocus={() => handleHoverToPrefetch(item.url)}
                onMouseEnter={() => handleHoverToPrefetch(item.url)}
                onMouseOver={() => handleHoverToPrefetch(item.url)}
                onPointerEnter={() => handleHoverToPrefetch(item.url)}
              >
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </React.Fragment>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
