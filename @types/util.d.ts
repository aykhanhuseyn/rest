export interface Pageable<T> {
	data: T[];
	page: number; // 0-based
	size: number; // 1-based
	total: number; // total number of items
}
