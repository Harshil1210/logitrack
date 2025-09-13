/**
 * @swagger
 * tags:
 *   name: MFA
 *   description: Multi-factor authentication endpoints
 */

/**
 * @swagger
 * /api/mfa/setupMfa:
 *   get:
 *     summary: Setup MFA for the user
 *     tags: [MFA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: MFA setup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 otpauth_url:
 *                   type: string
 *                 qrCodeImage:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/mfa/verifyMfa:
 *   post:
 *     summary: Verify MFA token
 *     tags: [MFA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: MFA verified successfully
 *       400:
 *         description: Invalid MFA token
 */
