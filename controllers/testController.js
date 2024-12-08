export const testController = (req, res) => {
  try {
    return res.status(200).send({
      success: true,
      message: "test controller successfully added",
    });
  } catch (error) {}
};
