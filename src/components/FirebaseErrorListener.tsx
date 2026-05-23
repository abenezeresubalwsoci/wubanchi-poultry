
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // Surface the error via toast for immediate feedback
      toast({
        variant: "destructive",
        title: "Security Rule Violation",
        description: `Access denied for ${error.context.operation} at ${error.context.path}.`,
      });
      
      // Re-throw to trigger the Next.js development overlay with contextual info
      throw error;
    };

    errorEmitter.on('permission-error', handlePermissionError);
  }, [toast]);

  return null;
}
