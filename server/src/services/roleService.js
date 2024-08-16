const Role = require("../model/roleSchema");

async function createRole(name, description = "") {
  try {
    const existingRole = await Role.findOne({ name });

    if (existingRole) {
      throw { status: 400, msg: `Role '${name}' đã tồn tại.` };
    }

    const role = new Role({ name, description });

    await role.save();

    return { status: 200, msg: `Role '${name}' đã được tạo.` };
  } catch (error) {
    console.error(error);
    return error;
  }
}

module.exports = {
  createRole,
};
