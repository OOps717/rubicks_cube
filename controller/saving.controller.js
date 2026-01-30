import db from "../db.js";

class SavingController {
  async createSaving(req, res) {
    try {
      const { duration, cubeInfo } = req.body;
      const response = await db.query(
        "INSERT INTO savings (duration) VALUES (TIME '00:00:00' + ($1 || ' seconds')::interval) RETURNING *",
        [duration],
      );
      if (response) {
        const cubeid = response.rows[0].cubeid;
        const values = [];
        const rows = [];

        cubeInfo.forEach((cube, i) => {
          const base = i * 7;

          rows.push(
            `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`,
          );

          values.push(
            cubeid,
            cube.position.x,
            cube.position.y,
            cube.position.z,
            cube.rotation._x,
            cube.rotation._y,
            cube.rotation._z,
          );
        });
        const query = `
          INSERT INTO cubesmodifications (cubeid, x, y, z, rotX, rotY, rotZ)
          VALUES ${rows.join(", ")}
          RETURNING *;
        `;

        await db.query("BEGIN");
        const result = await db.query(query, values);
        await db.query("COMMIT");
        res.json({
          cubeid,
          duration,
          modifications: result.rows,
        });
      }
    } catch (err) {
      console.error(err);
      await db.query("ROLLBACK");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getOneSaving(req, res) {
    try {
      const cubeid = req.params.cubeid;
      const result = await db.query(
        `
        SELECT
          s.cubeid,
          EXTRACT(EPOCH FROM s.duration)::INT AS duration,
          s.created_at,
          cm.x, cm.y, cm.z,
          cm.rotx, cm.roty, cm.rotz
        FROM savings s
        JOIN cubesmodifications cm
          ON s.cubeid = cm.cubeid
        WHERE s.cubeid = $1
        ORDER BY cm.id;
      `,
        [cubeid],
      );
      res.json({
        cubeid: result.rows[0]?.cubeid,
        duration: result.rows[0]?.duration,
        created_at: result.rows[0]?.created_at,
        cubes: result.rows.map((r) => ({
          x: r.x,
          y: r.y,
          z: r.z,
          rotX: r.rotx,
          rotY: r.roty,
          rotZ: r.rotz,
        })),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB error" });
    }
  }

  async getLatestSaving(req, res) {
    try {
      const result = await db.query(`
        SELECT
          s.cubeid,
          EXTRACT(EPOCH FROM s.duration)::INT AS duration,
          s.created_at,
          cm.x, cm.y, cm.z,
          cm.rotx, cm.roty, cm.rotz
        FROM savings s
        JOIN cubesmodifications cm
          ON s.cubeid = cm.cubeid
        WHERE s.cubeid = (
          SELECT cubeid
          FROM savings
          ORDER BY created_at DESC
          LIMIT 1
        )
        ORDER BY cm.id;
      `);
      res.json({
        cubeid: result.rows[0]?.cubeid,
        duration: result.rows[0]?.duration,
        created_at: result.rows[0]?.created_at,
        cubes: result.rows.map((r) => ({
          x: r.x,
          y: r.y,
          z: r.z,
          rotX: r.rotx,
          rotY: r.roty,
          rotZ: r.rotz,
        })),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB error" });
    }
  }

  async getAllSavings(req, res) {
    try {
      const savings = await db.query("SELECT * FROM savings");
      res.json(savings);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB error" });
    }
  }

  async updateSaving(req, res) {
    try {
      const { cubeid, duration } = req.body;
      const saving = await db.query(
        "UPDATE savings SET duration=$2 WHERE cubeid=$1 RETURNING *",
        [cubeid, duration],
      );
      res.json(saving);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB error" });
    }
  }

  async deleteSaving(req, res) {
    try {
      const { cubeid } = req.body;
      console.log(cubeid);
      await db.query("DELETE FROM savings WHERE cubeid=$1", [cubeid]);
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB error" });
    }
  }
}

export default SavingController;
