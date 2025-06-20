'use client';

import type { Icon } from '@tabler/icons-react';
import React from 'react';

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

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    label?: string;
  }[];
}) {
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
                onMouseOver={() => handleHoverToPrefetch(item.url)}
                onMouseEnter={() => handleHoverToPrefetch(item.url)}
                onPointerEnter={() => handleHoverToPrefetch(item.url)}
              >
                <SidebarMenuButton tooltip={item.title} asChild>
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
