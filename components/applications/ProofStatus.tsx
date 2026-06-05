import { BadgeText, Heading, HStack, Text, VStack } from "@gluestack-ui/themed";
import React from "react";
import { LeaveApplication } from "@/model/LeaveApplication";
import { getProofStatusDisplay } from "@/components/applications/adminProofStatus";
import type { ProofStatusDisplay } from "@/components/applications/adminProofStatus";

type ProofStatusVariant = "review" | "history" | "detail";

interface ProofStatusBadgeProps {
    proofStatus: ProofStatusDisplay;
    variant?: ProofStatusVariant;
}

interface ProofStatusSummaryProps {
    application: LeaveApplication;
}

const getBadgeColors = (tone:ProofStatusDisplay["tone"]) => {
    switch(tone){
        case "warning":
            return { backgroundColor: "#FFF3E0", color: "#B45309", dotColor: "#F59E0B" };
        case "success":
            return { backgroundColor: "#E8F5EE", color: "#1F7A4D", dotColor: "#22C55E" };
        default:
            return { backgroundColor: "#F3F4F6", color: "#6B7280", dotColor: "#9CA3AF" };
    }
};

export const ProofStatusBadge:React.FC<ProofStatusBadgeProps> = ({ proofStatus, variant = "review" }) => {
    const colors = getBadgeColors(proofStatus.tone);
    const opacity = variant === "history" && proofStatus.tone === "warning" ? 0.92 : 1;

    return (
        <HStack
            data-testid={`proof-status-badge-${proofStatus.kind}`}
            alignItems="center"
            borderRadius={999}
            paddingHorizontal={8}
            height={24}
            maxWidth="100%"
            style={{ backgroundColor: colors.backgroundColor, opacity }}
        >
            <Text
                aria-hidden
                marginRight={6}
                width={6}
                height={6}
                borderRadius={999}
                style={{ backgroundColor: colors.dotColor }}
            />
            <BadgeText
                fontSize={12}
                fontWeight="$medium"
                color={colors.color}
                numberOfLines={1}
                style={{ lineHeight: 24 }}
            >
                {proofStatus.label}
            </BadgeText>
        </HStack>
    );
};

export const ProofStatusSummary:React.FC<ProofStatusSummaryProps> = ({ application }) => {
    const proofStatus = getProofStatusDisplay(application);

    return (
        <VStack
            data-testid="proof-status-summary"
            marginBottom={14}
            padding={10}
            borderWidth={1}
            borderRadius={8}
            borderColor="$borderLight200"
            space="xs"
        >
            <HStack alignItems="center" justifyContent="space-between" flexWrap="wrap">
                <Heading size="sm" color="$textDark900" marginRight={8}>
                    Proof
                </Heading>
                <ProofStatusBadge proofStatus={proofStatus} variant="detail" />
            </HStack>
            {proofStatus.kind === "missing" ? (
                <VStack>
                    <Text fontSize={13} color="$textLight700">
                        Proof required for this sick leave
                    </Text>
                    <Text fontSize={13} color="#B45309">
                        No file uploaded yet
                    </Text>
                </VStack>
            ) : null}
            {proofStatus.kind === "submitted" ? (
                <VStack>
                    <Text fontSize={13} color="$textLight700">
                        {proofStatus.uploadedAtText ? `Uploaded ${proofStatus.uploadedAtText}` : "Proof file uploaded"}
                    </Text>
                    <Text fontSize={13} color="$textLight700" numberOfLines={1} ellipsizeMode="middle">
                        {proofStatus.filenameText ? `Filename: ${proofStatus.filenameText}` : "Filename unavailable"}
                    </Text>
                </VStack>
            ) : null}
            {proofStatus.kind === "not_required" ? (
                <Text fontSize={13} color="$textLight700">
                    No proof required for this request
                </Text>
            ) : null}
        </VStack>
    );
};
