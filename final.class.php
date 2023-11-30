<?php
class final_rest
{



	/**
	 * @api  /api/v1/setTemp/
	 * @apiName setTemp
	 * @apiDescription Add remote temperature measurement
	 *
	 * @apiParam {string} location
	 * @apiParam {String} sensor
	 * @apiParam {double} value
	 *
	 * @apiSuccess {Integer} status
	 * @apiSuccess {string} message
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     {
	 *              "status":0,
	 *              "message": ""
	 *     }
	 *
	 * @apiError Invalid data types
	 *
	 * @apiErrorExample Error-Response:
	 *     HTTP/1.1 200 OK
	 *     {
	 *              "status":1,
	 *              "message":"Error Message"
	 *     }
	 *
	 */
	public static function setTemp($location, $sensor, $value)
	{
		if (!is_numeric($value)) {
			$retData["status"] = 1;
			$retData["message"] = "'$value' is not numeric";
		} else {
			try {
				EXEC_SQL("insert into temperature (location, sensor, value, date) values (?,?,?,CURRENT_TIMESTAMP)", $location, $sensor, $value);
				$retData["status"] = 0;
				$retData["message"] = "insert of '$value' for location: '$location' and sensor '$sensor' accepted";
			} catch (Exception $e) {
				$retData["status"] = 1;
				$retData["message"] = $e->getMessage();
			}
		}

		return json_encode($retData);
	}
	/**
	 * @api  /api/v1/getProduct/
	 * @apiName getProduct
	 * @apiDescription Get list of products.
	 *
	 * @apiParam {string} category
	 * @apiParam {String} subcategory
	 * @apiParam {Integer} id
	 *
	 * @apiSuccess {Integer} status
	 * @apiSuccess {string} message
	 * @apiSuccess {Array} result
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     {
	 *              "status":0,
	 *              "message": ""
	 * 				"result": []
	 *     }
	 *
	 * @apiError Invalid data types
	 *
	 * @apiErrorExample Error-Response:
	 *     HTTP/1.1 200 OK
	 *     {
	 *              "status":1,
	 *              "message":"Error Message"
	 *     }
	 *
	 */
	public static function getProduct($category, $subcategory, $id)
	{
		try {
			$retData["status"] = 0;
			$retData["message"] = "Query Successful.";
			$retData["result"] = GET_SQL("select * from
			product where category like ? and subcategory
			like ? and (product_id = ? or ? = '0') order by
			description", $category, $subcategory, $id, $id);
		} catch (Exception $e) {
			$retData["status"] = 1;
			$retData["message"] = $e->getMessage();
		}

		return json_encode($retData);
	}

	public static function getCategories()
	{
		try {
			$retData["status"] = 0;
			$retData["message"] = "Query Successful.";
			$retData["result"] = GET_SQL("SELECT DISTINCT category FROM product");
		} catch (Exception $e) {
			$retData["status"] = 1;
			$retData["message"] = $e->getMessage();
		}

		return json_encode($retData);
	}
	public static function getSubCategories($category)
	{
		try {
			$retData["status"] = 0;
			$retData["message"] = "Query Successful.";
			$retData["result"] = GET_SQL("SELECT DISTINCT subcategory FROM product WHERE category like ?", $category);
		} catch (Exception $e) {
			$retData["status"] = 1;
			$retData["message"] = $e->getMessage();
		}

		return json_encode($retData);
	}

	public static function openCart()
	{
		try {
			EXEC_SQL("INSERT INTO cart (cartID,closed) VALUES (NULL,NULL)");

			$retData["status"] = 0;
			$retData["message"] = "Cart opened successfully.";
			$retData["cartID"] = intval(GET_SQL("select max(cartID) as cartID from cart")[0]["cartID"]);
		} catch (Exception $e) {
			$retData["status"] = 1;
			$retData["message"] = "Error opening cart: " . $e->getMessage();
		}
		
		return json_encode($retData);
	}
	
	public static function addToCart($cart, $product, $quantity)
	{
		try {
			if (GET_SQL("SELECT closed FROM cart WHERE cartID=?",$cart)[0]["closed"] != null) {
				throw new Exception("Can not modify closed out cart.");
			}
			
			// If cart already has an entry for given product.
			$count = GET_SQL("SELECT quantity as q FROM product_cart WHERE product_id=? and cartID=?", $product, $cart)[0]['q'];
			if ($count[0]['q'] > 0) {
				$change = intval($quantity) + intval($count);
				if ($change < 1) {
					EXEC_SQL("DELETE FROM product_cart WHERE cartID=? AND product_id=?", $cart, $product);
					$quantity = -$count;
				} else {
					EXEC_SQL("UPDATE product_cart SET quantity=? WHERE cartID = ? and product_id=?", $change, $cart, $product);
				}
			} else {
				if ($quantity <= 0 ) {
					throw new Exception("Can't add negative quantity.");
				}
				$retData["data"] = GET_SQL("INSERT INTO product_cart (product_id,cartID, quantity) VALUES (?,?,?)", $product, $cart, $quantity);
			}
			$dPrice = floatval($quantity) * floatval(GET_SQL("SELECT price FROM product WHERE product_id=?",$product)[0]['price']);
			EXEC_SQL("UPDATE cart SET total=total+? WHERE cartID=?",$dPrice, $cart);
			$retData["status"] = 0;
			$retData["test"] = $dPrice;
			$retData["message"] = "Cart updated successfully.";
		} catch (Exception $e) {
			$retData["status"] = 1;
			$retData["message"] = "Error opening cart: " . $e->getMessage();
		}

		return json_encode($retData);
	}
	
	public static function getCart($cartID)
	{
		try {
			$retData["status"] = 0;
			$retData["closed"]=GET_SQL("SELECT closed FROM cart WHERE cartID=?",$cartID)[0]["closed"];
			$retData["message"] = "Successfully retreived cart.";
			$retData["total"] = GET_SQL("select total from cart where cartID=?", $cartID)[0]["total"];
			$retData["cart"] = GET_SQL("select title, quantity, product.product_id from product join product_cart on product.product_id=product_cart.product_id where cartID=?", $cartID);
		} catch (Exception $e) {
			$retData["status"] = 1;
			$retData["message"] = "Error opening cart: " . $e->getMessage();
		}
		
		return json_encode($retData);
	}
	
	
	public static function closeCart($cartID, $amount, $method)
	{
		try {
			$total = GET_SQL("select total from cart where cartID=?", $cartID)[0]["total"];
			$change = floatval($amount) - floatval($total);
			
			if ($change < 0) {
				throw new Exception("Not enough money.");
			}

			if ($method == "card") {
				$change = 0;
			}

			EXEC_SQL("UPDATE cart set closed = date() where cartID=?", $cartID);

			$retData["status"] = 1;
			$retData["message"] = "Successfully closed cart.";
			$retData["change"] = $change;
		} catch (Exception $e) {
			$retData["status"] = 1;
			$retData["message"] = "Error closing cart: " . $e->getMessage();
		}
		return json_encode($retData);
	}


}

