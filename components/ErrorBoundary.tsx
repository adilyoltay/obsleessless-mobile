import React, { Component, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo: errorInfo.componentStack,
    });

    // TODO: Report error to analytics service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text variant="headlineSmall" style={styles.title}>
                😔 Bir Hata Oluştu
              </Text>
              
              <Text variant="bodyMedium" style={styles.description}>
                Üzgünüz, beklenmeyen bir hata oluştu. Lütfen uygulamayı yeniden başlatmayı deneyin.
              </Text>

              {__DEV__ && this.state.error && (
                <View style={styles.debugInfo}>
                  <Text variant="titleSmall" style={styles.debugTitle}>
                    Debug Bilgisi:
                  </Text>
                  <Text variant="bodySmall" style={styles.errorText}>
                    {this.state.error.message}
                  </Text>
                  {this.state.errorInfo && (
                    <Text variant="bodySmall" style={styles.stackTrace}>
                      {this.state.errorInfo}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.actions}>
                <Button 
                  mode="contained" 
                  onPress={this.handleRetry}
                  style={styles.retryButton}
                >
                  Tekrar Dene
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  errorCard: {
    maxWidth: 400,
    width: '100%',
    elevation: 4,
    borderRadius: 12,
  },
  title: {
    textAlign: 'center',
    color: '#EF4444',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    color: '#374151',
    marginBottom: 20,
    lineHeight: 22,
  },
  debugInfo: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  debugTitle: {
    color: '#B91C1C',
    marginBottom: 8,
    fontWeight: '600',
  },
  errorText: {
    color: '#DC2626',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  stackTrace: {
    color: '#7F1D1D',
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 14,
  },
  actions: {
    alignItems: 'center',
  },
  retryButton: {
    minWidth: 120,
  },
});

// Simple error boundary component
interface SimpleErrorBoundaryProps {
  children: ReactNode;
  fallbackMessage?: string;
}

export function SimpleErrorBoundary({ 
  children, 
  fallbackMessage = 'Bir şeyler yanlış gitti' 
}: SimpleErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <View style={styles.simpleFallback}>
          <Text variant="bodyLarge" style={styles.simpleFallbackText}>
            {fallbackMessage}
          </Text>
        </View>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

const simpleFallbackStyles = StyleSheet.create({
  simpleFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  simpleFallbackText: {
    textAlign: 'center',
    color: '#6B7280',
  },
}); 