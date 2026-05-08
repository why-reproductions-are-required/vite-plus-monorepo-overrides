function joinApiMessage(service: string, version: string, region: string, status: string): string {
  return `${service}:${version}:${region}:${status}`;
}

export const formattedWithApiPrintWidth = joinApiMessage('orders-api-service', 'v2026.05.08', 'us-east-1', 'ready');
