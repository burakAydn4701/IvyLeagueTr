import { Suspense } from 'react';
import EditForm from './edit-form';

export default async function EditCommunity({ params }: { params: Promise<{ name: string }> }) {
    const resolvedParams = await params;
    
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditForm communityName={resolvedParams.name} />
        </Suspense>
    );
} 