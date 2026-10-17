import type { ImageValue } from "emdash";

/** The fields of a getEmDashCollection("posts") entry that the cards read. */
export interface PostEntry {
	id: string;
	data: {
		id: string;
		title?: string;
		excerpt?: string;
		publishedAt?: Date | null;
		featured_image?: ImageValue | null;
	};
	edit: Record<string, Record<string, unknown>>;
}
