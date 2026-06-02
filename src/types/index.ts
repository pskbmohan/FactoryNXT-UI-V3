// Equipment Types
export interface WorkCenter {
  id: string;
  plant_code: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Station {
  id: string;
  plant_code: string;
  work_center_id?: string;
  code: string;
  name: string;
  sequence: number;
  requires_operator: boolean;
  cfx_station_id?: string;
  is_active: boolean;
}

export interface Equipment {
  id: string;
  plant_code: string;
  station_id?: string;
  asset_id: string;
  name: string;
  category: EquipmentCategory;
  make?: string;
  model?: string;
  serial_number?: string;
  cfx_machine_id?: string;
  opcua_node_id?: string;
  mqtt_topic_root?: string;
  pm_interval_cycles?: number;
  calibration_interval_days?: number;
  current_status: EquipmentStatus;
  status_since?: string;
  total_cycles: number;
  next_pm_due_at?: string;
  last_calibrated_at?: string;
  is_active: boolean;
}

export type EquipmentCategory = 'SMT' | 'AOI' | 'AXI' | 'SOLDER' | 'CONVEYOR' | 'TEST' | 'PACK' | 'OTHER';
export type EquipmentStatus = 'IDLE' | 'RUNNING' | 'MAINTENANCE' | 'DOWN' | 'SETUP' | 'CALIBRATION';

export interface MaintenanceRecord {
  id: string;
  equipment_id: string;
  maintenance_type: MaintenanceType;
  status: MaintenanceStatus;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  performed_by?: string;
  downtime_minutes?: number;
}

export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'CALIBRATION' | 'EMERGENCY';
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED';

// Production Order Types
export interface ProductionOrder {
  id: string;
  order_number: string;
  plant_code: string;
  line_id: string;
  part_number: string;
  revision: string;
  quantity_ordered: number;
  quantity_completed: number;
  quantity_scrapped: number;
  status: OrderStatus;
  priority: number;
  planned_start?: string;
  planned_end?: string;
  actual_start?: string;
  actual_end?: string;
  erp_order_id?: string;
  notes?: string;
  created_at: string;
}

export type OrderStatus =
  | 'PLANNED'
  | 'RELEASED'
  | 'IN_PROGRESS'
  | 'PARTIALLY_COMPLETED'
  | 'COMPLETED'
  | 'CLOSED'
  | 'CANCELLED'
  | 'ON_HOLD';

// Quality Types
export interface NCR {
  ncr_id: string;
  ncr_number: string;
  plant_code: string;
  order_id: string;
  item_id?: string;
  lot_id?: string;
  defect_code: string;
  description: string;
  detected_at: string;
  detected_by: string;
  status: string;
  disposition?: string;
  disposition_by?: string;
  disposition_at?: string;
  disposition_notes?: string;
  is_customer_hold: boolean;
  quarantine_location?: string;
  capa_id?: string;
}

export interface CAPA {
  capa_id: string;
  capa_number: string;
  ncr_id: string;
  plant_code: string;
  title: string;
  problem_statement: string;
  root_cause_analysis: Record<string, any>;
  corrective_actions: Record<string, any>;
  preventive_actions: Record<string, any>;
  owner_id: string;
  due_date?: string;
  status: string;
  verified_by?: string;
  effectiveness_check_date?: string;
}

// Identity Types
export interface Plant {
  id: string;
  code: string;
  name: string;
  country?: string;
  timezone_str: string;
  is_active: boolean;
}

export interface ProductionLine {
  id: string;
  plant_id: string;
  code: string;
  name: string;
  line_type: string;
  is_active: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  plant_codes: string[];
  roles: string[];
  is_active: boolean;
}

// SMT Materials Types
export interface InventoryLot {
  lot_id: string;
  lot_number: string;
  plant_code: string;
  material_id: string;
  quantity_received: number;
  quantity_remaining: number;
  received_at: string;
  expiry_date?: string;
  supplier_lot?: string;
  location_code?: string;
  msd_floor_life_remaining_hours?: number;
  is_rohs: boolean;
  is_reach: boolean;
  conflict_minerals_free: boolean;
  is_quarantined: boolean;
  bake_count: number;
}

export interface Reel {
  reel_id: string;
  reel_id_scan: string;
  plant_code: string;
  lot_id: string;
  material_id: string;
  feeder_id?: string;
  quantity_initial: number;
  quantity_remaining: number;
  opened_at: string;
  last_used_at: string;
  is_active: boolean;
  splice_count: number;
}

// Traceability Types
export interface UnitGenealogy {
  serial_number: string;
  item_id: string;
  order_id: string;
  product_pn?: string;
  status: string;
  current_step_id?: string;
  station_history: ScanRecord[];
  defect_history: DefectRecord[];
  rework_events: ReworkEvent[];
  ncrs: NCRSummary[];
  fpy: number;
}

export interface ScanRecord {
  scan_id: string;
  station_id: string;
  scan_type: string;
  operator_id: string;
  scanned_at: string;
}

export interface DefectRecord {
  defect_id: string;
  defect_code: string;
  description: string;
  disposition: string;
  station_id: string;
  recorded_at: string;
  recorded_by: string;
}

export interface ReworkEvent {
  scan_id: string;
  scan_type: string;
  station_id: string;
  scanned_at: string;
}

export interface NCRSummary {
  ncr_id: string;
  ncr_number: string;
  defect_code: string;
  status: string;
  disposition?: string;
}

// Operator Session Types
export interface OperatorSession {
  session_id: string;
  operator_id: string;
  station_id: string;
  order_id: string;
  plant_code: string;
  login_at: string;
  logout_at?: string;
  is_active: boolean;
}

// Generic API Response Types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  detail: string | Record<string, any>;
  status_code?: number;
}
