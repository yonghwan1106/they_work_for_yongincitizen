/**
 * PocketBase TypeScript Types
 *
 * Manually defined types for PocketBase collections
 * Auto-generated types can be created using: pocketbase-typegen
 */

/**
 * Base record fields (all collections have these)
 */
export interface BaseRecord {
  id: string; // 15-character random string
  created: string; // ISO 8601 timestamp
  updated: string; // ISO 8601 timestamp
  collectionId: string;
  collectionName: string;
}

/**
 * Councillor (의원)
 */
export interface Councillor extends BaseRecord {
  name: string;
  name_en?: string;
  councillor_type: '국회의원' | '경기도의원' | '용인시의원';
  party?: string;
  district?: string;
  photo?: string; // Filename only (not full URL)
  term_number?: number;
  is_active: boolean;
  email?: string;
  phone?: string;
  office_location?: string;
  profile_url?: string;
}

/**
 * Committee (위원회)
 */
export interface Committee extends BaseRecord {
  name: string;
  name_en?: string;
  type?: '상임위원회' | '특별위원회';
  description?: string;
}

/**
 * Councillor-Committee Relationship (의원-위원회 관계)
 */
export interface CouncillorCommittee extends BaseRecord {
  councillor: string; // Relation ID
  committee: string; // Relation ID
  role?: '위원장' | '부위원장' | '위원';
  start_date?: string; // ISO 8601 date
  end_date?: string;
}

/**
 * Meeting (회의)
 */
export interface Meeting extends BaseRecord {
  title: string;
  meeting_type?: '본회의' | '상임위원회' | '특별위원회';
  committee?: string; // Relation ID
  meeting_date: string; // ISO 8601 date
  session_number?: number;
  meeting_number?: number;
  transcript_url?: string;
  video_url?: string;
  transcript_text?: string;
  is_processed: boolean;
}

/**
 * Bill (의안)
 */
export interface Bill extends BaseRecord {
  bill_number: string;
  title: string;
  bill_type?: '조례안' | '예산안' | '동의안' | '결의안';
  proposer?: string; // Relation ID
  proposal_date?: string; // ISO 8601 date
  status?: '발의' | '상정' | '가결' | '부결' | '폐기';
  result?: '원안가결' | '수정가결' | '부결';
  summary?: string;
  full_text?: string;
  bill_url?: string;
}

/**
 * Bill Cosponsor (의안 공동발의자)
 */
export interface BillCosponsor extends BaseRecord {
  bill: string; // Relation ID
  councillor: string; // Relation ID
}

/**
 * Speech (발언)
 */
export interface Speech extends BaseRecord {
  meeting: string; // Relation ID
  councillor: string; // Relation ID
  speech_text: string;
  speech_order?: number;
  summary?: string; // AI-generated summary
  keywords?: string[]; // JSON array
}

/**
 * Vote (표결)
 */
export interface Vote extends BaseRecord {
  bill: string; // Relation ID
  councillor: string; // Relation ID
  vote_cast: '찬성' | '반대' | '기권';
  is_verified: boolean; // Human-verified data
}

/**
 * Expanded types (with relations)
 */

export interface CouncillorExpanded extends Councillor {
  expand?: {
    councillor_committees_via_councillor?: CouncillorCommitteeExpanded[];
  };
}

export interface CouncillorCommitteeExpanded extends CouncillorCommittee {
  expand?: {
    councillor?: Councillor;
    committee?: Committee;
  };
}

export interface MeetingExpanded extends Meeting {
  expand?: {
    committee?: Committee;
  };
}

export interface BillExpanded extends Bill {
  expand?: {
    proposer?: Councillor;
    bill_cosponsors_via_bill?: BillCosponsorExpanded[];
  };
}

export interface BillCosponsorExpanded extends BillCosponsor {
  expand?: {
    bill?: Bill;
    councillor?: Councillor;
  };
}

export interface SpeechExpanded extends Speech {
  expand?: {
    meeting?: Meeting;
    councillor?: Councillor;
  };
}

export interface VoteExpanded extends Vote {
  expand?: {
    bill?: Bill;
    councillor?: Councillor;
  };
}

/**
 * PocketBase List Result
 */
export interface ListResult<T> {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

/**
 * Search/Filter helpers
 */
export type CouncillorType = '국회의원' | '경기도의원' | '용인시의원';
export type CommitteeType = '상임위원회' | '특별위원회';
export type MeetingType = '본회의' | '상임위원회' | '특별위원회';
export type BillType = '조례안' | '예산안' | '동의안' | '결의안';
export type BillStatus = '발의' | '상정' | '가결' | '부결' | '폐기';
export type BillResult = '원안가결' | '수정가결' | '부결';
export type CommitteeRole = '위원장' | '부위원장' | '위원';
