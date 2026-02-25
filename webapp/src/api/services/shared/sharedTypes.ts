// ============================================================================
// Icon (Value Object)
// ============================================================================

export interface IconDTO {
  code: string;
  colorHex: string;
}

export interface PagedListResponse<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  data: T[];
}
