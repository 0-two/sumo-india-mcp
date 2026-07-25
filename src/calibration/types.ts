export interface SumoVehicleType {
  vClass: string;
  length: number;       // in meters
  width: number;        // in meters
  minGap: number;       // longitudinal gap in meters
  minGapLat: number;    // lateral gap in meters (crucial for side-by-side gap filling and filtering)
  accel: number;        // acceleration in m/s^2
  decel: number;        // deceleration in m/s^2
  maxSpeed: number;     // maximum speed in m/s
  description?: string; // descriptive notes on typical Indian models
}

export type IndianVehicleProfiles = {
  two_wheeler: SumoVehicleType;
  auto_rickshaw: SumoVehicleType;
  passenger_car: SumoVehicleType;
  bus: SumoVehicleType;
};
