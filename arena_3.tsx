extends Node3D

var blue_energy = 100
var red_energy = 100
var reactor_active = false

var blue_energy_bar: ProgressBar
var red_energy_bar: ProgressBar
var game_status_label: Label

# Your existing functions continue below.
var reactor_energy: float = 100.0
var energy_drain_rate: float = 2.0
var game_over: bool = false
const ARENA_SIZE := 24.0
const SPEED := 6.0

var player_blue: Node3D
var player_red: Node3D
var reactor: Node3D
var exit_door: MeshInstance3D
var status_label: Label

var laser_time := 0.0
var hit_times: Dictionary = {}

var blue_start := Vector3(-8, 0, 8)
var red_start := Vector3(8, 0, -8)

var blue_mat: StandardMaterial3D
var red_mat: StandardMaterial3D
var metal_mat: StandardMaterial3D
var floor_mat: StandardMaterial3D
var orange_mat: StandardMaterial3D
var laser_mat: StandardMaterial3D
var cell_mat: StandardMaterial3D
var exit_mat: StandardMaterial3D


func _ready() -> void:
	create_materials()
	create_floor()
	create_walls()
	create_reactor()
	create_platforms()
	create_lasers()
	create_energy_cells()
	create_exit()
	create_players()
	create_camera()
	create_ui()


func make_material(color: Color, glow := false) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	if glow:
		mat.emission_enabled = true
		mat.emission = color
		mat.emission_energy_multiplier = 2.5
	return mat


func create_materials() -> void:
	blue_mat = make_material(Color(0.05, 0.4, 1.0), true)
	red_mat = make_material(Color(1.0, 0.04, 0.08), true)
	metal_mat = make_material(Color(0.12, 0.16, 0.23))
	floor_mat = make_material(Color(0.035, 0.05, 0.09))
	orange_mat = make_material(Color(1.0, 0.38, 0.025), true)
	laser_mat = make_material(Color(1.0, 0.015, 0.025), true)
	cell_mat = make_material(Color(0.0, 0.9, 1.0), true)
	exit_mat = make_material(Color(0.05, 0.35, 1.0), true)


func add_box(
	parent: Node3D,
	box_size: Vector3,
	pos: Vector3,
	mat: Material,
	object_name: String = "Box"
) -> MeshInstance3D:
	var obj := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = box_size
	obj.mesh = mesh
	obj.material_override = mat
	obj.position = pos
	obj.name = object_name
	parent.add_child(obj)
	return obj


func add_cylinder(
	parent: Node3D,
	radius: float,
	height: float,
	pos: Vector3,
	mat: Material,
	object_name: String
) -> MeshInstance3D:
	var obj := MeshInstance3D.new()
	var mesh := CylinderMesh.new()
	mesh.top_radius = radius
	mesh.bottom_radius = radius
	mesh.height = height
	obj.mesh = mesh
	obj.material_override = mat
	obj.position = pos
	obj.name = object_name
	parent.add_child(obj)
	return obj


func create_floor() -> void:
	add_box(
		self, Vector3(ARENA_SIZE, 0.5, ARENA_SIZE),
		Vector3(0, -0.3, 0), floor_mat, "MetalFloor"
	)

	# Floor grid lines
	for i in range(-10, 11, 2):
		add_box(
			self, Vector3(0.035, 0.012, 22),
			Vector3(i, -0.035, 0), blue_mat, "FloorGrid"
		)
		add_box(
			self, Vector3(22, 0.012, 0.035),
			Vector3(0, -0.034, i), metal_mat, "FloorGrid"
		)


func create_walls() -> void:
	add_box(self, Vector3(24, 3, 0.5),
		Vector3(0, 1.2, -12), metal_mat, "NorthWall")
	add_box(self, Vector3(24, 3, 0.5),
		Vector3(0, 1.2, 12), metal_mat, "SouthWall")
	add_box(self, Vector3(0.5, 3, 24),
		Vector3(-12, 1.2, 0), metal_mat, "WestWall")
	add_box(self, Vector3(0.5, 3, 24),
		Vector3(12, 1.2, 0), metal_mat, "EastWall")

	# Decorative wall lights
	for x in [-8.0, -4.0, 4.0, 8.0]:
		add_box(self, Vector3(0.15, 1.5, 0.08),
			Vector3(x, 1.0, -11.7), blue_mat, "WallLight")


func create_reactor() -> void:
	reactor = Node3D.new()
	reactor.name = "ReactorCore"
	add_child(reactor)

	add_cylinder(reactor, 2.2, 0.25,
		Vector3(0, 0.05, 0), metal_mat, "Base")
	add_cylinder(reactor, 1.6, 0.2,
		Vector3(0, 0.25, 0), orange_mat, "GlowingRing")
	add_cylinder(reactor, 0.65, 2.8,
		Vector3(0, 1.7, 0), orange_mat, "EnergyColumn")
	add_cylinder(reactor, 1.0, 0.18,
		Vector3(0, 3.1, 0), metal_mat, "TopRing")

	for angle in range(0, 360, 90):
		var a := deg_to_rad(float(angle))
		add_box(reactor, Vector3(0.2, 2.0, 0.2),
			Vector3(cos(a) * 1.8, 1.0, sin(a) * 1.8),
			metal_mat, "ReactorSupport")


func create_platforms() -> void:
	for pos in [
		Vector3(-7, 0.15, 0),
		Vector3(7, 0.15, 0),
		Vector3(0, 0.15, -7),
		Vector3(0, 0.15, 7)
	]:
		add_box(self, Vector3(3, 0.3, 3),
			pos, metal_mat, "Platform")

	# Cover crates
	for pos in [
		Vector3(-8, 0.6, -4),
		Vector3(8, 0.6, 4),
		Vector3(-5, 0.6, 7),
		Vector3(5, 0.6, -7)
	]:
		add_box(self, Vector3(1.5, 1.2, 1.5),
			pos, metal_mat, "CoverCrate")


func create_lasers() -> void:
	add_box(self, Vector3(16, 0.08, 0.08),
		Vector3(0, 0.9, -5), laser_mat, "LaserBarrier1")
	add_box(self, Vector3(0.08, 0.08, 15),
		Vector3(-5, 1.0, 0), laser_mat, "LaserBarrier2")
	add_box(self, Vector3(12, 0.08, 0.08),
		Vector3(4, 1.1, 5), laser_mat, "LaserBarrier3")


func create_energy_cells() -> void:
	for pos in [
		Vector3(-8, 0.65, 2),
		Vector3(8, 0.65, -2),
		Vector3(-3, 0.65, -8),
		Vector3(3, 0.65, 8)
	]:
		var cell := add_cylinder(
			self, 0.35, 0.6, pos, cell_mat, "EnergyCell"
		)
		cell.set_meta("collected", false)


func create_exit() -> void:
	exit_door = add_box(
		self, Vector3(2.5, 3.0, 0.4),
		Vector3(0, 1.5, -11.4), exit_mat, "ExitDoor"
	)
	exit_door.material_override = metal_mat

	add_box(self, Vector3(2.0, 2.5, 0.12),
		Vector3(0, 1.5, -11.1), blue_mat, "ExitGlow")


func create_player(pos: Vector3, mat: Material,
		player_name: String) -> Node3D:
	var p := Node3D.new()
	p.name = player_name
	p.position = pos
	add_child(p)

	var body := MeshInstance3D.new()
	var capsule := CapsuleMesh.new()
	capsule.radius = 0.45
	capsule.height = 1.6
	body.mesh = capsule
	body.material_override = mat
	body.position.y = 0.8
	p.add_child(body)

	var marker := MeshInstance3D.new()
	var marker_mesh := BoxMesh.new()
	marker_mesh.size = Vector3(0.7, 0.08, 0.7)
	marker.mesh = marker_mesh
	marker.material_override = mat
	marker.position.y = 0.05
	p.add_child(marker)

	return p


func create_players() -> void:
	player_blue = create_player(blue_start, blue_mat, "BlueRunner")
	player_red = create_player(red_start, red_mat, "RedSaboteur")


func create_camera() -> void:
	var camera := Camera3D.new()
	add_child(camera)
	camera.position = Vector3(19, 25, 29)
	camera.look_at(Vector3(0, 0, 0), Vector3.UP)
	camera.current = true
	camera.fov = 55


func create_ui() -> void:
	var canvas := CanvasLayer.new()
	add_child(canvas)

	status_label = Label.new()
	status_label.position = Vector2(20, 20)
	status_label.add_theme_font_size_override("font_size", 22)
	status_label.add_theme_color_override(
		"font_color", Color(0.3, 0.85, 1.0)
	)
	canvas.add_child(status_label)
	update_ui()


func update_ui() -> void:
	if status_label:
		var state := "LOCKED"
		if reactor_active:
			state = "UNLOCKED"
		status_label.text = (
            "CHAOS CONTROL — REACTOR CORE\n"
			+ "BLUE: WASD | RED: ARROWS\n"
			+ "E: Activate reactor when nearby\n"
			+ "Blue energy: " + str(blue_energy)
			+ " | Red energy: " + str(red_energy)
			+ "\nReactor: " + state
		)


func _process(delta: float) -> void:
	move_player(player_blue, "blue", delta)
	move_player(player_red, "red", delta)
	collect_cells(player_blue, "blue")
	collect_cells(player_red, "red")

	laser_time += delta
	update_laser_visuals()
	check_lasers(player_blue)
	check_lasers(player_red)

	if Input.is_key_pressed(KEY_E):
		if player_blue.global_position.distance_to(Vector3.ZERO) < 3.0:
			activate_reactor()

	if Input.is_key_pressed(KEY_ENTER):
		if player_red.global_position.distance_to(Vector3.ZERO) < 3.0:
			activate_reactor()


func move_player(p: Node3D, team: String, delta: float) -> void:
	if p == null:
		return

	var x_axis := 0.0
	var z_axis := 0.0

	if team == "blue":
		x_axis = float(Input.is_key_pressed(KEY_D)) - float(Input.is_key_pressed(KEY_A))
		z_axis = float(Input.is_key_pressed(KEY_S)) - float(Input.is_key_pressed(KEY_W))
	else:
		x_axis = float(Input.is_key_pressed(KEY_RIGHT)) - float(Input.is_key_pressed(KEY_LEFT))
		z_axis = float(Input.is_key_pressed(KEY_DOWN)) - float(Input.is_key_pressed(KEY_UP))

	var direction := Vector3(x_axis, 0, z_axis).normalized()
	p.position += direction * SPEED * delta
	p.position.x = clampf(p.position.x, -10.5, 10.5)
	p.position.z = clampf(p.position.z, -10.5, 10.5)


func collect_cells(p: Node3D, team: String) -> void:
	for cell in get_tree().get_nodes_in_group("unused"):
		pass

	for cell in get_children():
		if cell is MeshInstance3D and cell.name == "EnergyCell":
			if cell.get_meta("collected", false):
				continue
			if p.global_position.distance_to(cell.global_position) < 1.0:
				cell.set_meta("collected", true)
				cell.visible = false
				if team == "blue":
					blue_energy += 1
				else:
					red_energy += 1
				update_ui()


func activate_reactor() -> void:
	if reactor_active:
		return

	reactor_active = true
	exit_door.material_override = exit_mat
	add_cylinder(self, 2.0, 0.12,
		Vector3(0, 0.3, 0), cell_mat, "ActivatedRing")
	update_ui()


func update_laser_visuals() -> void:
	var moving := laser_time > 10.0
	var beam := get_node_or_null("LaserBarrier3")
	if beam:
		beam.position.z = 5.0 + sin(laser_time * 1.5) * (1.5 if moving else 0.0)


func check_lasers(p: Node3D) -> void:
	if p == null:
		return

	var near_laser := (
		absf(p.position.z + 5.0) < 0.5
		and absf(p.position.x) < 8.0
	) or (
		absf(p.position.x + 5.0) < 0.5
		and absf(p.position.z) < 7.5
	) or (
		absf(p.position.z - 5.0) < 0.5
		and absf(p.position.x - 4.0) < 6.0
	)

	var id := p.get_instance_id()
	if near_laser:
		if not hit_times.has(id):
			hit_times[id] = 5.0
		else:
			hit_times[id] -= get_process_delta_time()
			if hit_times[id] <= 0.0:
				p.position = blue_start if p == player_blue else red_start
				hit_times.erase(id)
				
			
    # Continue with the rest of the HUD code here


