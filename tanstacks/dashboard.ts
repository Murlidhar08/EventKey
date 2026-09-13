"use client";

import { getFirstName } from "@/actions/dashboard.actions";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "./keys";

export const useFirstName = () => {
    return useQuery({
        queryKey: QUERY_KEYS.user.name,
        queryFn: () => getFirstName(),
    });
};