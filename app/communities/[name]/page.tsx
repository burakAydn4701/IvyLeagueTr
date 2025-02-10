import { Suspense } from 'react';
import CommunityContent from './community-content';
import ContentContainer from '@/app/components/content-container';

export default async function CommunityPage({ params }: { params: Promise<{ name: string }> }) {
    const resolvedParams = await params;
    
    return (
        <ContentContainer>
            <Suspense fallback={<div>Loading...</div>}>
                <CommunityContent communityName={resolvedParams.name} />
            </Suspense>
        </ContentContainer>
    );
} 