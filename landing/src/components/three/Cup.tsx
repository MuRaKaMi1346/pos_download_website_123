const CERAMIC = '#efe6d8'

/**
 * Procedural stylized espresso cup (landing brief §6 / pos-ui-motion §4.7):
 * cylinder body + torus rim + torus handle + saucer. No GLB needed — a real
 * Tripo model can drop in later.
 */
export default function Cup() {
  return (
    <group>
      {/* saucer */}
      <mesh position={[0, -0.78, 0]}>
        <cylinderGeometry args={[1.25, 1.3, 0.07, 64]} />
        <meshStandardMaterial color={CERAMIC} roughness={0.7} metalness={0.04} />
      </mesh>
      {/* body (tapered) */}
      <mesh>
        <cylinderGeometry args={[0.86, 0.64, 1.32, 64]} />
        <meshStandardMaterial color={CERAMIC} roughness={0.6} metalness={0.04} />
      </mesh>
      {/* rim */}
      <mesh position={[0, 0.66, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.84, 0.055, 20, 64]} />
        <meshStandardMaterial color={CERAMIC} roughness={0.55} />
      </mesh>
      {/* coffee surface */}
      <mesh position={[0, 0.64, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 64]} />
        <meshStandardMaterial color="#3a2113" roughness={0.25} metalness={0.1} />
      </mesh>
      {/* handle */}
      <mesh position={[0.95, 0.02, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[0.32, 0.075, 16, 40, Math.PI * 1.35]} />
        <meshStandardMaterial color={CERAMIC} roughness={0.6} />
      </mesh>
    </group>
  )
}
