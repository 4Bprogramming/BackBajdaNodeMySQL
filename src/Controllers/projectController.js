const { cloudinary_js_config } = require('../Config/cloudinary');
const { Project, Image } = require('../db.js');
const cloudinary = require('cloudinary').v2;


// Crear un nuevo proyecto y asociar imágenes
exports.createProject = async (req, res) => {
  try {
    const { images, ...projectData } = req.body;
    const project = await Project.create(projectData);
    
    if (images && images.length > 0) {
      const imageRecords = images.map((object, index) => ({
        url: object.secure_url,
        main: index === 0? true : false,
        cloudinaryID: object.public_id,
        projectId: project.id
      }));
      await Image.bulkCreate(imageRecords);
    }

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los proyectos con sus imágenes
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({ include: Image });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un proyecto por ID con sus imágenes
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, { include: Image });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un proyecto y sus imágenes
exports.updateProject = async (req, res) => {
  try {
    const { images, ...projectData } = req.body;
    await Project.update(projectData, { where: { id: req.params.id } });

    if (images && images.length > 0) {
          
      // Crear nuevas imágenes
      const imagesUpdate = images.filter((image) => image.secure_url);
      const imageRecords = imagesUpdate.map((image, index) => ({
        url: image.secure_url,
        main: image.main ? image.main : false,
        cloudinaryID: image.public_id,
        projectId: req.params.id
      }));
      await Image.bulkCreate(imageRecords);
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un proyecto y sus imágenes asociadas
exports.deleteProject = async (req, res) => {
  try {
    const { imageIds, projectId } = req.body;

    if (imageIds && imageIds.length > 0) {
      // Desconectar y eliminar imágenes
      await Promise.all(
        imageIds.map(async (idImage) => {
          await Image.destroy({ where: { cloudinaryID: idImage } });
        })
      );
    }

    if (projectId) {
      // Eliminar imágenes del proyecto en Cloudinary
      const images = await Image.findAll({ where: { projectId } });
      const publicIds = images.map(image => image.cloudinaryID);

     cloudinary_js_config;

      await Promise.all(
        publicIds.map(async (id) => {
          const response = await cloudinary.uploader.destroy(id);
          if (response.result !== "ok") {
            throw new Error(`Failed to delete image with ID ${id}: ${response.result}`);
          }
        })
      );

      await Image.destroy({ where: { projectId } });
      await Project.destroy({ where: { id: projectId } });
    }

    res.status(204).json({ message: "Images and/or project deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
