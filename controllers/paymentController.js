export const handlePaymentPayload = async (req, res) => {
  try {
    res.status(200).json(req.body);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
